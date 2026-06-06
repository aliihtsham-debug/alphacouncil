"use client";

/**
 * Portfolio Data Hook
 *
 * Wraps usePortfolioStore + wallet address.
 * Auto-fetches portfolio when wallet is connected.
 * Uses TanStack Query for server state.
 */

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useWallet } from "./use-wallet";
import type { PortfolioAnalysis } from "@/types/portfolio";

async function fetchPortfolio(address: string): Promise<PortfolioAnalysis> {
  const res = await fetch(`/api/portfolio?address=${address}&chain=BNB`);
  const result = await res.json();

  if (!result.success) {
    throw new Error(result.error ?? "Failed to load portfolio");
  }

  return result.data;
}

export function usePortfolio() {
  const { address, isConnected } = useWalletStore();
  const { refreshPortfolio } = useWallet();
  const { data, isLoading, error, setPortfolio, setLoading, setError } =
    usePortfolioStore();

  const { data: queryData, isLoading: queryLoading, error: queryError } = useQuery({
    queryKey: ["portfolio", address] as const,
    queryFn: () => fetchPortfolio(address!),
    enabled: isConnected && !!address,
    staleTime: 30_000, // 30 seconds
    gcTime: 300_000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Sync query data to Zustand store
  React.useEffect(() => {
    if (queryData) {
      setPortfolio(queryData);
    }
  }, [queryData, setPortfolio]);

  React.useEffect(() => {
    if (queryLoading) {
      setLoading(true);
    }
  }, [queryLoading, setLoading]);

  React.useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : "Failed to load portfolio");
    }
  }, [queryError, setError]);

  const refresh = React.useCallback(() => {
    if (address) {
      setLoading(true);
      refreshPortfolio().catch(() => {
        fetch(`/api/portfolio?address=${address}&chain=BNB`)
          .then((res) => res.json())
          .then((result) => {
            if (result.success) {
              setPortfolio(result.data);
            } else {
              setError(result.error ?? "Failed to refresh");
            }
          })
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
      });
    }
  }, [address, setPortfolio, setLoading, setError, refreshPortfolio]);

  return {
    portfolio: data,
    isLoading,
    error,
    refresh,
    isConnected,
  };
}
