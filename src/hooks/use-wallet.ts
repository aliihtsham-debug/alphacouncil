"use client";

import * as React from "react";
import { useWalletStore } from "@/stores/wallet-store";
import { connectWallet, disconnectWallet as disconnect } from "@/services/trust-wallet";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { analyzePortfolio } from "@/services/portfolio/analyzer";

export function useWallet() {
  const { address, isConnected, isConnecting, connect: storeConnect, disconnect: storeDisconnect, setConnecting } = useWalletStore();
  const { setPortfolio, setLoading, setError } = usePortfolioStore();

  const handleConnect = React.useCallback(async () => {
    try {
      setConnecting(true);
      const state = await connectWallet("BNB");
      storeConnect(state.address!, "BNB");

      // Create or fetch user in database
      if (state.address) {
        try {
          await fetch("/api/portfolio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: state.address, chain: "BNB" }),
          });
        } catch (dbError) {
          console.error("Failed to create user record:", dbError);
        }
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [storeConnect, setConnecting]);

  const handleDisconnect = React.useCallback(() => {
    disconnect();
    storeDisconnect();
  }, [storeDisconnect]);

  // Listen for wallet account/chain changes
  React.useEffect(() => {
    const ethereum = (window as unknown as Record<string, unknown>).ethereum as {
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    } | undefined;

    if (!ethereum?.on) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        storeDisconnect();
      } else {
        storeConnect(accountList[0], useWalletStore.getState().chain);
      }
    };

    const handleChainChanged = () => {
      // Reload on chain change to reset all chain-specific state
      window.location.reload();
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [storeConnect, storeDisconnect]);

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
