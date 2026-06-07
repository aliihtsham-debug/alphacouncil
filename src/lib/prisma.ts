/**
 * Prisma Client Singleton
 *
 * Prevents multiple PrismaClient instances during hot-reload in development.
 * Uses the pg driver adapter for Prisma 7 direct database connections.
 *
 * See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import "dotenv/config";

let PrismaClientClass: any = null;
let adapterInstance: any = null;

async function getAdapter() {
  if (!adapterInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
        "Please configure it in your .env.local file (development) or deployment environment variables (production)."
      );
    }
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    adapterInstance = new PrismaPg(pool);
  }
  return adapterInstance;
}

async function getPrismaClientClass(): Promise<unknown> {
  if (!PrismaClientClass) {
    try {
      const mod = (await import("@prisma/client")) as Record<string, unknown>;
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
    const [ClientClass, adapter] = await Promise.all([
      getPrismaClientClass(),
      getAdapter(),
    ]);
    globalForPrisma.prisma = new (ClientClass as any)({ adapter });
  }
  return globalForPrisma.prisma;
}

// Synchronous proxy — first call triggers async init, subsequent calls use cached client
let initPromise: Promise<unknown> | null = null;

function ensureInit() {
  if (!initPromise) {
    initPromise = getClient();
  }
  return initPromise;
}

export const prisma: any = new Proxy({} as Record<string, unknown>, {
  get(_target, prop) {
    if (prop === "then") return undefined; // Prevent being treated as a Promise
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
