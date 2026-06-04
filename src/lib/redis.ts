/**
 * Redis Client
 *
 * Uses ioredis when REDIS_URL is set, otherwise exports no-op wrappers
 * so the app works without a Redis connection (dev/demo mode).
 */

// ─── No-op fallback ─────────────────────────────────────

interface RedisLike {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<"OK">;
  setex: (key: string, ttl: number, value: string) => Promise<"OK">;
  del: (...keys: string[]) => Promise<number>;
  exists: (...keys: string[]) => Promise<number>;
  expire: (key: string, ttl: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
  keys: (pattern: string) => Promise<string[]>;
  flushall: () => Promise<"OK">;
  quit: () => Promise<"OK">;
  on: (_event: string, _handler: (...args: unknown[]) => void) => void;
}

const noOpRedis: RedisLike = {
  get: async () => null,
  set: async () => "OK" as const,
  setex: async () => "OK" as const,
  del: async () => 0,
  exists: async () => 0,
  expire: async () => 0,
  ttl: async () => -2,
  keys: async () => [],
  flushall: async () => "OK" as const,
  quit: async () => "OK" as const,
  on: () => {
    /* no-op */
  },
};

// ─── Client initialization ──────────────────────────────

function createRedisClient(): RedisLike {
  const url = process.env.REDIS_URL;

  if (!url) {
    console.log("⚠️  REDIS_URL not set — using no-op Redis client");
    return noOpRedis;
  }

  try {
    // Dynamic require so build succeeds without ioredis installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Redis = require("ioredis") as new (url: string, opts: Record<string, unknown>) => RedisLike;
    const client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) return null; // stop retrying
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true,
    });

    client.on("error", (...args: unknown[]) => {
      const err = args[0] as { message: string };
      console.error("Redis error:", err?.message ?? args[0]);
    });

    return client;
  } catch (error) {
    console.error("Failed to create Redis client:", error);
    return noOpRedis;
  }
}

export const redis: RedisLike = createRedisClient();

// ─── Cache helpers ──────────────────────────────────────

export const CACHE_TTL = {
  MARKET_DATA: 60, // 1 minute
  CATEGORIES: 3600, // 1 hour
  TRENDING: 120, // 2 minutes
  SESSION: 300, // 5 minutes
  PORTFOLIO: 30, // 30 seconds
} as const;

/**
 * Get cached data or fetch from source.
 */
export async function getOrSet<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // Invalid JSON, refetch
    }
  }

  const data = await fetcher();
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch {
    // Redis write failed, ignore
  }
  return data;
}

/**
 * Invalidate a cache key.
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // Redis delete failed, ignore
  }
}
