/**
 * CoinMarketCap service — unified entry point.
 * Falls back to mock data when API key is not configured.
 * Uses Redis caching layer when available.
 */

import { getEnv } from "@/lib/env";
import * as client from "./client";
import * as cache from "./cache";
import { mockTokens, mockCategories, mockGlobalMetrics } from "./mock-data";
import type { CMCToken, CMCCategory } from "./types";

function useMock() {
  return !getEnv().COINMARKETCAP_API_KEY;
}

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
  if (useMock()) {
    return {
      totalMarketCap: mockGlobalMetrics.totalMarketCap,
      totalVolume24h: mockGlobalMetrics.totalVolume24h,
      btcDominance: mockGlobalMetrics.btcDominance,
      ethDominance: mockGlobalMetrics.ethDominance,
      fearGreedIndex: mockGlobalMetrics.fearGreedIndex,
      fearGreedClassification: mockGlobalMetrics.fearGreedClassification,
      topTokens: mockTokens.slice(0, 10),
    };
  }

  return cache.getCachedMarketOverview(async () => {
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
      console.error("CMC API error, falling back to mock:", error);
      return {
        totalMarketCap: mockGlobalMetrics.totalMarketCap,
        totalVolume24h: mockGlobalMetrics.totalVolume24h,
        btcDominance: mockGlobalMetrics.btcDominance,
        ethDominance: mockGlobalMetrics.ethDominance,
        fearGreedIndex: mockGlobalMetrics.fearGreedIndex,
        fearGreedClassification: mockGlobalMetrics.fearGreedClassification,
        topTokens: mockTokens.slice(0, 10),
      };
    }
  });
}

export async function getTrendingTokens(limit = 20): Promise<CMCToken[]> {
  if (useMock()) {
    return mockTokens.slice(0, limit);
  }

  return cache.getCachedTrending(limit, async () => {
    try {
      return await client.getTrendingTokens(limit);
    } catch (error) {
      console.error("CMC trending error:", error);
      return mockTokens.slice(0, limit);
    }
  });
}

export async function getTopGainers(limit = 20): Promise<CMCToken[]> {
  if (useMock()) {
    return [...mockTokens]
      .sort(
        (a, b) =>
          (b.quote.USD.percent_change_24h ?? 0) -
          (a.quote.USD.percent_change_24h ?? 0)
      )
      .slice(0, limit);
  }

  return cache.getCachedGainers(limit, async () => {
    try {
      return await client.getTopGainers(limit);
    } catch (error) {
      console.error("CMC gainers error:", error);
      return mockTokens.slice(0, limit);
    }
  });
}

export async function getTopLosers(limit = 20): Promise<CMCToken[]> {
  if (useMock()) {
    return [...mockTokens]
      .sort(
        (a, b) =>
          (a.quote.USD.percent_change_24h ?? 0) -
          (b.quote.USD.percent_change_24h ?? 0)
      )
      .slice(0, limit);
  }

  return cache.getCachedLosers(limit, async () => {
    try {
      return await client.getTopLosers(limit);
    } catch (error) {
      console.error("CMC losers error:", error);
      return mockTokens.slice(0, limit);
    }
  });
}

export async function getTokensByCategory(
  category: string,
  limit = 50
): Promise<CMCToken[]> {
  if (useMock()) {
    const categoryMap: Record<string, string[]> = {
      AI: ["ai-big-data", "ai-agents", "artificial-intelligence"],
      DeFi: ["defi", "decentralized-finance"],
      Gaming: ["gaming", "metaverse", "play-to-earn"],
      BNB: ["bnb-chain", "binance-smart-chain", "bsc"],
      Meme: ["memes", "dog-themed"],
      Layer1: ["layer-1"],
      Layer2: ["layer-2", "scaling"],
      Infrastructure: ["oracle", "storage"],
    };

    const tags = categoryMap[category] ?? [category.toLowerCase()];
    return mockTokens.filter((t) =>
      t.tags.some((tag) => tags.some((ct) => tag.includes(ct)))
    );
  }

  return cache.getCachedTokensByCategory(category, limit, async () => {
    try {
      const response = await client.getTokenListings({
        category,
        limit,
        sort: "market_cap",
        sort_dir: "desc",
      });
      return response.data;
    } catch (error) {
      console.error("CMC category error:", error);
      return mockTokens.slice(0, limit);
    }
  });
}

export async function getCategories(): Promise<CMCCategory[]> {
  if (useMock()) {
    return mockCategories;
  }

  return cache.getCachedCategories(async () => {
    try {
      const response = await client.getCategories();
      return response.data;
    } catch (error) {
      console.error("CMC categories error:", error);
      return mockCategories;
    }
  });
}

export async function getTokenBySymbol(
  symbol: string
): Promise<CMCToken | null> {
  if (useMock()) {
    return mockTokens.find((t) => t.symbol === symbol) ?? null;
  }

  return cache.getCachedTokenBySymbol(symbol, async () => {
    try {
      const tokens = await client.getTokensBySymbol([symbol]);
      return tokens[0] ?? null;
    } catch (error) {
      console.error("CMC symbol lookup error:", error);
      return mockTokens.find((t) => t.symbol === symbol) ?? null;
    }
  });
}
