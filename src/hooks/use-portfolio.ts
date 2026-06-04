"use client";

/**
 * Portfolio Data Hook
 *
 * Wraps usePortfolioStore + wallet address.
 * Auto-fetches portfolio when wallet is connected.
 */

import * as React from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useWallet } from "./use-wallet";

export function usePortfolio() {
  const { address, isConnected } = useWalletStore();
  const { refreshPortfolio } = useWallet();
  const { data, isLoading, error, setPortfolio, setLoading, setError } =
    usePortfolioStore();

  // Auto-fetch portfolio when wallet is connected
  React.useEffect(() => {
    if (isConnected && address && !data && !isLoading) {
      setLoading(true);
      refreshPortfolio().catch(() => {
        // Fallback: fetch from API directly
        fetch(`/api/portfolio?address=${address}&chain=BNB`)
          .then((res) => res.json())
          .then((result) => {
            if (result.success) {
              setPortfolio(result.data);
            } else {
              setError(result.error ?? "Failed to load portfolio");
            }
          })
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
      });
    }
  }, [isConnected, address, data, isLoading, setPortfolio, setLoading, setError, refreshPortfolio]);

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
