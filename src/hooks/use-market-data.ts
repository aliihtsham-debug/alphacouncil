"use client";

/**
 * Market Data Hook
 *
 * Fetches market overview from /api/market.
 * Uses stale-while-revalidate pattern (60s cache).
 */

import * as React from "react";

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

interface MarketDataState {
  overview: MarketOverview | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const STALE_TIME = 60_000; // 60 seconds

export function useMarketData() {
  const [state, setState] = React.useState<MarketDataState>({
    overview: null,
    isLoading: false,
    error: null,
    lastFetched: null,
  });

  const fetchOverview = React.useCallback(async (force = false) => {
    // Return cached data if fresh enough
    if (
      !force &&
      state.overview &&
      state.lastFetched &&
      Date.now() - state.lastFetched < STALE_TIME
    ) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch("/api/market/overview");
      const result = await res.json();

      if (result.success) {
        setState({
          overview: result.data,
          isLoading: false,
          error: null,
          lastFetched: Date.now(),
        });
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error ?? "Failed to fetch market data",
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Network error",
      }));
    }
  }, [state.overview, state.lastFetched]);

  // Fetch on mount
  React.useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const refresh = React.useCallback(() => {
    fetchOverview(true);
  }, [fetchOverview]);

  return {
    overview: state.overview,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
    isStale: state.lastFetched
      ? Date.now() - state.lastFetched >= STALE_TIME
      : true,
  };
}
