/**
 * CoinMarketCap service — unified entry point.
 * Uses Redis caching layer when available.
 * Requires a valid COINMARKETCAP_API_KEY — no mock fallback.
 */

import * as client from "./client";
import * as cache from "./cache";
import type { CMCToken, CMCCategory } from "./types";

// ─── Market Overview type ───────────────────────────────

export interface MarketOverviewData {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  fearGreedIndex: number;
  fearGreedClassification: string;
  topTokens: CMCToken[];
}

// ─── Public API (with Redis caching) ────────────────────

export async function getMarketOverview(): Promise<MarketOverviewData> {
  return cache.getCachedMarketOverview(async () => {
    const [metrics, fearGreed, listings] = await Promise.all([
      client.getGlobalMetrics(),
      client.getFearGreedIndex(),
      client.getTokenListings({ limit: 10 }),
    ]);

    return {
      totalMarketCap: metrics.data.quote.USD.total_market_cap,
      totalVolume24h: metrics.data.quote.USD.total_volume_24h,
      btcDominance: metrics.data.btc_dominance,
      ethDominance: metrics.data.eth_dominance,
      fearGreedIndex: fearGreed.value,
      fearGreedClassification: fearGreed.classification,
      topTokens: listings.data,
    };
  });
}

export async function getTrendingTokens(limit = 20): Promise<CMCToken[]> {
  return cache.getCachedTrending(limit, async () => {
    return await client.getTrendingTokens(limit);
  });
}

export async function getTopGainers(limit = 20): Promise<CMCToken[]> {
  return cache.getCachedGainers(limit, async () => {
    return await client.getTopGainers(limit);
  });
}

export async function getTopLosers(limit = 20): Promise<CMCToken[]> {
  return cache.getCachedLosers(limit, async () => {
    return await client.getTopLosers(limit);
  });
}

export async function getTokensByCategory(
  category: string,
  limit = 50
): Promise<CMCToken[]> {
  return cache.getCachedTokensByCategory(category, limit, async () => {
    const response = await client.getTokenListings({
      category,
      limit,
      sort: "market_cap",
      sort_dir: "desc",
    });
    return response.data;
  });
}

export async function getCategories(): Promise<CMCCategory[]> {
  return cache.getCachedCategories(async () => {
    const response = await client.getCategories();
    return response.data;
  });
}

export async function getTokenBySymbol(
  symbol: string
): Promise<CMCToken | null> {
  return cache.getCachedTokenBySymbol(symbol, async () => {
    const tokens = await client.getTokensBySymbol([symbol]);
    return tokens[0] ?? null;
  });
}
