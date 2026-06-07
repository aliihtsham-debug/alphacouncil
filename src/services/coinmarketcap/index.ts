/**
 * CoinMarketCap service — unified entry point.
 * Requires a valid COINMARKETCAP_API_KEY — no mock fallback.
 */

import * as client from "./client";
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

// ─── Public API ─────────────────────────────────────────

export async function getMarketOverview(): Promise<MarketOverviewData | null> {
  try {
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
  } catch (error) {
    console.error("Failed to fetch market overview:", error);
    return null;
  }
}

export async function getTrendingTokens(limit = 20): Promise<CMCToken[]> {
  try {
    return await client.getTrendingTokens(limit);
  } catch (error) {
    console.error("Failed to fetch trending tokens:", error);
    return [];
  }
}

export async function getTopGainers(limit = 20): Promise<CMCToken[]> {
  try {
    return await client.getTopGainers(limit);
  } catch (error) {
    console.error("Failed to fetch top gainers:", error);
    return [];
  }
}

export async function getTopLosers(limit = 20): Promise<CMCToken[]> {
  try {
    return await client.getTopLosers(limit);
  } catch (error) {
    console.error("Failed to fetch top losers:", error);
    return [];
  }
}

export async function getTokensByCategory(
  category: string,
  limit = 50
): Promise<CMCToken[]> {
  try {
    const response = await client.getTokenListings({
      category,
      limit,
      sort: "market_cap",
      sort_dir: "desc",
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch tokens by category:", error);
    return [];
  }
}

export async function getCategories(): Promise<CMCCategory[]> {
  try {
    const response = await client.getCategories();
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function getTokenBySymbol(
  symbol: string
): Promise<CMCToken | null> {
  try {
    const tokens = await client.getTokensBySymbol([symbol]);
    return tokens[0] ?? null;
  } catch (error) {
    console.error("Failed to fetch token by symbol:", error);
    return null;
  }
}
