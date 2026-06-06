/**
 * Redis Client
 *
 * Uses ioredis when REDIS_URL is set to a valid URL, otherwise exports
 * no-op wrappers so the app works without a Redis connection (dev/demo mode).
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

// ─── Client initialization ──────────────

function isValidRedisUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "redis:" || parsed.protocol === "rediss:";
  } catch {
    return false;
  }
}

function createRedisClient(): RedisLike {
  const url = process.env.REDIS_URL?.trim();

  if (!url || !isValidRedisUrl(url)) {
    return noOpRedis;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Redis = require("ioredis") as new (url: string, opts: Record<string, unknown>) => RedisLike;
    const client = new Redis(url, {
      maxRetriesPerRequest: 0,
      retryStrategy: () => null, // don't retry
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 2000,
    });

    client.on("error", () => {
      // Suppress connection errors — app works without Redis
    });

    return client;
  } catch {
    return noOpRedis;
  }
}

export const redis: RedisLike = createRedisClient();

// ─── Cache helpers ──────────────────────────────────────

export const CACHE_TTL = {
  MARKET_DATA: 60,
  CATEGORIES: 3600,
  TRENDING: 120,
  SESSION: 300,
  PORTFOLIO: 30,
} as const;

/**
 * Get cached data or fetch from source.
 */
export async function getOrSet<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        // Invalid JSON, refetch
      }
    }
  } catch {
    // Redis read failed, continue to fetch
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
