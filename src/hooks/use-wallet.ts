"use client";

import * as React from "react";
import { useWalletStore } from "@/stores/wallet-store";
import { connectWallet, disconnectWallet as disconnect } from "@/services/trust-wallet";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { analyzePortfolio } from "@/services/portfolio/analyzer";

export function useWallet() {
  const { address, isConnected, isConnecting, connect: storeConnect, disconnect: storeDisconnect } = useWalletStore();
  const { setPortfolio, setLoading, setError } = usePortfolioStore();

  const handleConnect = React.useCallback(async () => {
    try {
      const state = await connectWallet("BNB");
      storeConnect(state.address!, "BNB");
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  }, [storeConnect]);

  const handleDisconnect = React.useCallback(() => {
    disconnect();
    storeDisconnect();
  }, [storeDisconnect]);

  const refreshPortfolio = React.useCallback(async () => {
    if (!address) return;

    setLoading(true);
    try {
      const { getWalletPortfolio } = await import("@/services/trust-wallet");
      const walletPortfolio = await getWalletPortfolio(address);
      const analysis = analyzePortfolio(walletPortfolio);
      setPortfolio(analysis);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to refresh portfolio");
    }
  }, [address, setPortfolio, setLoading, setError]);

  return {
    address,
    isConnected,
    isConnecting,
    connect: handleConnect,
    disconnect: handleDisconnect,
    refreshPortfolio,
  };
}
