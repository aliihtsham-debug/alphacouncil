/**
 * CoinMarketCap Cache Service
 *
 * Redis-backed caching wrapper for CMC API calls.
 * Falls back to no-cache when Redis is unavailable.
 *
 * TTLs:
 * - Market data: 60s
 * - Categories: 3600s
 * - Trending: 120s
 */

import { redis, CACHE_TTL, getOrSet } from "@/lib/redis";

// ─── Cache key helpers ───────────────────────────────────

export const cacheKeys = {
  marketOverview: () => "cmc:market:overview",
  trending: (limit: number) => `cmc:trending:${limit}`,
  gainers: (limit: number) => `cmc:gainers:${limit}`,
  losers: (limit: number) => `cmc:losers:${limit}`,
  tokensByCategory: (category: string, limit: number) =>
    `cmc:tokens:${category}:${limit}`,
  categories: () => "cmc:categories",
  tokenBySymbol: (symbol: string) => `cmc:token:${symbol.toLowerCase()}`,
} as const;

// ─── Cached fetchers ─────────────────────────────────────

export async function getCachedMarketOverview(
  fetcher: () => Promise<unknown>
) {
  return getOrSet(
    cacheKeys.marketOverview(),
    CACHE_TTL.MARKET_DATA,
    fetcher
  );
}

export async function getCachedTrending(
  limit: number,
  fetcher: () => Promise<unknown>
) {
  return getOrSet(
    cacheKeys.trending(limit),
    CACHE_TTL.TRENDING,
    fetcher
  );
}

export async function getCachedGainers(
  limit: number,
  fetcher: () => Promise<unknown>
) {
  return getOrSet(
    cacheKeys.gainers(limit),
    CACHE_TTL.MARKET_DATA,
    fetcher
  );
}

export async function getCachedLosers(
  limit: number,
  fetcher: () => Promise<unknown>
) {
  return getOrSet(
    cacheKeys.losers(limit),
    CACHE_TTL.MARKET_DATA,
    fetcher
  );
}

export async function getCachedTokensByCategory(
  category: string,
  limit: number,
  fetcher: () => Promise<unknown>
) {
  return getOrSet(
    cacheKeys.tokensByCategory(category, limit),
    CACHE_TTL.MARKET_DATA,
    fetcher
  );
}

export async function getCachedCategories(
  fetcher: () => Promise<unknown>
) {
  return getOrSet(
    cacheKeys.categories(),
    CACHE_TTL.CATEGORIES,
    fetcher
  );
}

export async function getCachedTokenBySymbol(
  symbol: string,
  fetcher: () => Promise<unknown>
) {
  return getOrSet(
    cacheKeys.tokenBySymbol(symbol),
    CACHE_TTL.MARKET_DATA,
    fetcher
  );
}

// ─── Cache invalidation ──────────────────────────────────

export async function invalidateMarketCache(): Promise<void> {
  try {
    const keys = await redis.keys("cmc:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Redis unavailable, ignore
  }
}
