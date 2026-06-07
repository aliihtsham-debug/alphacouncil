"use client";

import * as React from "react";
import { useWalletStore } from "@/stores/wallet-store";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { analyzePortfolio } from "@/services/portfolio/analyzer";
import { createSiweMessage } from "@/lib/auth";
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
          "No wallet detected. Please install Trust Wallet or MetaMask browser extension."
        );
      }

      // Request account access
      let accounts: string[];
      try {
        accounts = (await ethereum.request({
          method: "eth_requestAccounts",
        })) as string[];
      } catch (err) {
        const code = (err as { code?: number })?.code;
        if (code === 4001 || code === -32003) {
          throw new Error("Connection rejected. Please approve the connection request in your wallet.");
        }
        throw new Error("Failed to request wallet accounts. Please unlock your wallet and try again.");
      }

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }

      const walletAddress = accounts[0];

      // Get chain ID
      let chainIdHex: string;
      try {
        chainIdHex = (await ethereum.request({
          method: "eth_chainId",
        })) as string;
      } catch {
        chainIdHex = "0x38"; // Default to BSC mainnet
      }
      const chainId = parseInt(chainIdHex, 16);

      // SIWE: Get nonce from server
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) {
        throw new Error("Authentication server error. Please try again.");
      }
      const nonceData = await nonceRes.json();
      if (!nonceData.success) {
        throw new Error("Failed to get authentication nonce");
      }

      // Build SIWE message using the auth library (ensures correct EIP-4361 format)
      const domain =
        typeof window !== "undefined" ? window.location.host : "localhost:3000";
      const uri =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      const siweMsg = createSiweMessage({
        address: walletAddress,
        chainId,
        nonce: nonceData.nonce,
        domain,
        uri,
      });
      const message = siweMsg.prepareMessage();

      // Sign the message with Trust Wallet
      let signature: string;
      try {
        signature = (await ethereum.request({
          method: "personal_sign",
          params: [message, walletAddress],
        })) as string;
      } catch (err) {
        const code = (err as { code?: number })?.code;
        if (code === 4001) {
          throw new Error("Signature rejected. Please sign the message in your wallet to continue.");
        }
        throw new Error("Failed to sign message. Please try again.");
      }

      // Verify signature with server
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) {
        const errorText = await verifyRes.text();
        throw new Error(`Server verification failed (${verifyRes.status}): ${errorText}`);
      }

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
