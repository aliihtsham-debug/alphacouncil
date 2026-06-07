/**
 * Prisma Client Singleton
 *
 * Prevents multiple PrismaClient instances during hot-reload in development.
 * Uses the pg driver adapter for Prisma 7 direct database connections.
 *
 * See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import "dotenv/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClientClass: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adapterInstance: any = null;

async function getAdapter() {
  if (!adapterInstance) {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    adapterInstance = new PrismaPg(pool);
  }
  return adapterInstance;
}

function getPrismaClientClass(): unknown {
  if (!PrismaClientClass) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require("@prisma/client") as Record<string, unknown>;
      PrismaClientClass = mod.PrismaClient ?? (mod as { default?: { PrismaClient: unknown } }).default?.PrismaClient;
      if (!PrismaClientClass) {
        throw new Error("PrismaClient not found in @prisma/client module");
      }
    } catch (e) {
      console.warn("@prisma/client not available — run `npx prisma generate` after setting DATABASE_URL", e);
      throw new Error("Prisma client not generated. Run: npx prisma generate");
    }
  }
  return PrismaClientClass;
}

const globalForPrisma = globalThis as unknown as {
  prisma: unknown | undefined;
};

async function getClient(): Promise<unknown> {
  if (!globalForPrisma.prisma) {
    const ClientClass = getPrismaClientClass();
    const adapter = await getAdapter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, new-cap
    globalForPrisma.prisma = new (ClientClass as any)({ adapter });
  }
  return globalForPrisma.prisma;
}

// Synchronous proxy — first call triggers async init, subsequent calls use cached client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initPromise: Promise<unknown> | null = null;

function ensureInit() {
  if (!initPromise) {
    initPromise = getClient();
  }
  return initPromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = new Proxy({} as Record<string, unknown>, {
  get(_target, prop) {
    if (prop === "then") return undefined; // Prevent being treated as a Promise
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = globalForPrisma.prisma;
    if (client) {
      const value = client[prop as string];
      if (typeof value === "function") {
        return value.bind(client);
      }
      return value;
    }
    // Return a function that awaits init then delegates
    return (...args: unknown[]) => {
      return ensureInit().then((c: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fn = (c as any)[prop];
        if (typeof fn === "function") {
          return fn.apply(c, args);
        }
        return fn;
      });
    };
  },
});

// Kick off initialization immediately
ensureInit();
