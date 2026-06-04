/**
 * Prisma Client Singleton
 *
 * Prevents multiple PrismaClient instances during hot-reload in development.
 * Uses dynamic require when @prisma/client types haven't been generated yet.
 *
 * See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClientClass: any = null;

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

function getClient(): unknown {
  if (!globalForPrisma.prisma) {
    const ClientClass = getPrismaClientClass();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, new-cap
    globalForPrisma.prisma = new (ClientClass as any)();
    if (process.env.NODE_ENV !== "production") {
      // Keep the single instance alive across hot reloads
    }
  }
  return globalForPrisma.prisma;
}

// Proxy all property access to the lazy client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = new Proxy({} as Record<string, unknown>, {
  get(_target, prop) {
    const client: any = getClient();
    const value = client[prop as string];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
