"use client";

import * as React from "react";
import { useWalletStore } from "@/stores/wallet-store";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { analyzePortfolio } from "@/services/portfolio/analyzer";
import type { WalletConnectionState } from "@/services/trust-wallet";

export function useWallet() {
  const {
    address,
    isConnected,
    isConnecting,
    connect: storeConnect,
    disconnect: storeDisconnect,
    setConnecting,
  } = useWalletStore();
  const { setPortfolio, setLoading, setError } = usePortfolioStore();

  const handleConnect = React.useCallback(async () => {
    try {
      setConnecting(true);

      // Check for Trust Wallet / any injected provider
      const ethereum = (window as unknown as Record<string, unknown>)
        .ethereum as {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      } | undefined;

      if (!ethereum) {
        throw new Error(
          "Trust Wallet not detected. Please install Trust Wallet browser extension."
        );
      }

      // Request account access
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }

      const walletAddress = accounts[0];

      // Get chain ID
      const chainIdHex = (await ethereum.request({
        method: "eth_chainId",
      })) as string;
      const chainId = parseInt(chainIdHex, 16);

      // SIWE: Get nonce from server
      const nonceRes = await fetch("/api/auth/nonce");
      const nonceData = await nonceRes.json();
      if (!nonceData.success) {
        throw new Error("Failed to get authentication nonce");
      }

      // Build SIWE message
      const domain =
        typeof window !== "undefined" ? window.location.host : "localhost:3000";
      const uri =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      const message = `${domain} wants you to sign in with your Ethereum account:
${walletAddress}

Sign in to Alpha Council

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonceData.nonce}
Issued At: ${new Date().toISOString()}`;

      // Sign the message with Trust Wallet
      const signature = (await ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      })) as string;

      // Verify signature with server
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || "Signature verification failed");
      }

      // Update store
      storeConnect(walletAddress, chainId === 56 ? "BNB" : "ETH");
    } catch (error) {
      console.error("Wallet connection failed:", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [storeConnect, setConnecting]);

  const handleDisconnect = React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    storeDisconnect();
  }, [storeDisconnect]);

  // Listen for wallet account/chain changes
  React.useEffect(() => {
    const ethereum = (window as unknown as Record<string, unknown>).ethereum as {
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: unknown[]) => void
      ) => void;
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
      setError(
        error instanceof Error ? error.message : "Failed to refresh portfolio"
      );
    } finally {
      setLoading(false);
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
