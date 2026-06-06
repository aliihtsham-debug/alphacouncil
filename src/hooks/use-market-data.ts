"use client";

/**
 * Market Data Hook
 *
 * Fetches market overview from /api/market/overview.
 * Uses TanStack Query for caching and stale-while-revalidate.
 */

import { useQuery } from "@tanstack/react-query";

export interface MarketOverview {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  fearGreedIndex: number;
  fearGreedClassification: string;
  topTokens: Array<{
    symbol: string;
    name: string;
    quote: {
      USD: {
        price: number;
        percent_change_24h: number;
        market_cap: number;
      };
    };
  }>;
}

async function fetchMarketOverview(): Promise<MarketOverview> {
  const res = await fetch("/api/market/overview");
  const result = await res.json();

  if (!result.success) {
    throw new Error(result.error ?? "Failed to fetch market data");
  }

  return result.data;
}

export function useMarketData() {
  const { data, isLoading, error, refetch, isStale } = useQuery({
    queryKey: ["market", "overview"] as const,
    queryFn: fetchMarketOverview,
    staleTime: 60_000, // 60 seconds
    gcTime: 300_000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    overview: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    refresh: () => refetch(),
    isStale: isStale ?? true,
  };
}
