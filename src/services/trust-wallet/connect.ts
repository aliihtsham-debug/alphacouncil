/**
 * Trust Wallet Connection Service
 *
 * Handles wallet connection via Trust Wallet's injected provider (window.ethereum).
 * No demo mode — requires a real wallet connection.
 */

import type { WalletConnectionState } from "./types";
import { SUPPORTED_CHAINS } from "./types";

/**
 * Connect to Trust Wallet (or any injected EIP-1193 provider).
 * Throws if no wallet is detected.
 */
export async function connectWallet(
  chain: string = "BNB"
): Promise<WalletConnectionState> {
  if (typeof window === "undefined") {
    throw new Error("Wallet connection requires browser environment");
  }

  const ethereum = (window as unknown as Record<string, unknown>)
    .ethereum as {
    request: (args: {
      method: string;
      params?: unknown[];
    }) => Promise<unknown>;
  } | undefined;

  if (!ethereum) {
    throw new Error(
      "Trust Wallet not detected. Please install Trust Wallet browser extension."
    );
  }

  // Request account access — this triggers the Trust Wallet popup
  const accounts = (await ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please unlock your wallet.");
  }

  // Get chain ID
  const chainIdHex = (await ethereum.request({
    method: "eth_chainId",
  })) as string;
  const chainId = parseInt(chainIdHex, 16);

  // If the requested chain doesn't match, try to switch
  const targetChain = SUPPORTED_CHAINS[chain];
  if (targetChain && chainId !== targetChain.chainId) {
    try {
      await switchNetwork(chain);
    } catch (error) {
      console.warn("Failed to switch network:", error);
      // Continue anyway — user might want to stay on current chain
    }
  }

  return {
    address: accounts[0],
    chainId,
    isConnected: true,
    connector: "injected",
  };
}

/**
 * Disconnect wallet.
 */
export function disconnectWallet(): WalletConnectionState {
  return {
    address: null,
    chainId: null,
    isConnected: false,
    connector: null,
  };
}

/**
 * Switch wallet network.
 */
export async function switchNetwork(chain: string): Promise<boolean> {
  const config = SUPPORTED_CHAINS[chain];
  if (!config) return false;

  const ethereum = (window as unknown as Record<string, unknown>)
    .ethereum as {
    request: (args: {
      method: string;
      params?: unknown[];
    }) => Promise<unknown>;
  } | undefined;

  if (!ethereum) return false;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${config.chainId.toString(16)}` }],
    });
    return true;
  } catch (error: unknown) {
    // Chain not added to wallet — try to add it
    const err = error as { code?: number };
    if (err.code === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${config.chainId.toString(16)}`,
              chainName: config.chainName,
              rpcUrls: [config.rpcUrl],
              nativeCurrency: {
                name: chain,
                symbol: chain,
                decimals: 18,
              },
            },
          ],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

/**
 * Check if wallet is connected.
 */
export function isWalletConnected(state: WalletConnectionState): boolean {
  return state.isConnected && state.address !== null;
}
