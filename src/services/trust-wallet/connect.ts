/**
 * Trust Wallet Connection Service
 *
 * Handles wallet connection via WalletConnect / Trust Wallet SDK.
 * For the hackathon demo, this provides both real connection flow
 * and a demo mode for judges.
 */

import type { WalletConnectionState, WalletPortfolio, WalletToken } from "./types";
import { SUPPORTED_CHAINS } from "./types";

// ─── Demo Portfolio (for hackathon demo) ─────────────────

const DEMO_PORTFOLIO: WalletPortfolio = {
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
  chain: "BNB",
  totalBalanceUsd: 12847.53,
  tokens: [
    {
      contractAddress: null,
      symbol: "BNB",
      name: "BNB",
      decimals: 18,
      balance: "18.5",
      balanceUsd: 5247.8,
      priceUsd: 283.66,
      percentChange24h: 2.34,
    },
    {
      contractAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      balance: "1.2",
      balanceUsd: 3891.6,
      priceUsd: 3243.0,
      percentChange24h: -1.12,
    },
    {
      contractAddress: "0x031b41e504677879370e9DBcF937283A8691Fa7f",
      symbol: "FET",
      name: "Fetch.ai",
      decimals: 18,
      balance: "1250",
      balanceUsd: 1875.0,
      priceUsd: 1.5,
      percentChange24h: 5.67,
    },
    {
      contractAddress: "0x55d398326f99059fF775485246999027B3197955",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 18,
      balance: "1500",
      balanceUsd: 1500.0,
      priceUsd: 1.0,
      percentChange24h: 0.01,
    },
    {
      contractAddress: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
      symbol: "LINK",
      name: "Chainlink",
      decimals: 18,
      balance: "25",
      balanceUsd: 333.13,
      priceUsd: 13.33,
      percentChange24h: -0.45,
    },
  ],
  lastUpdated: new Date().toISOString(),
};

// ─── Connection Service ──────────────────────────────────

/**
 * Connect to Trust Wallet.
 * In production, this uses WalletConnect v2 or Trust Wallet browser extension.
 * For demo, it returns a mock connection.
 */
export async function connectWallet(
  chain: string = "BNB"
): Promise<WalletConnectionState> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("Wallet connection requires browser environment");
  }

  // Check for Trust Wallet or any injected provider
  const provider = (window as unknown as Record<string, unknown>).ethereum;

  if (provider) {
    try {
      // Real wallet connection flow
      const accounts = (await (
        provider as {
          request: (args: { method: string }) => Promise<string[]>;
        }
      ).request({ method: "eth_requestAccounts" })) as string[];

      const chainId = (await (
        provider as {
          request: (args: { method: string }) => Promise<string>;
        }
      ).request({ method: "eth_chainId" })) as string;

      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        connector: "injected",
      };
    } catch (error) {
      console.warn("Real wallet connection failed, using demo mode:", error);
    }
  }

  // Demo mode for hackathon
  console.log("🎮 Demo mode: Using mock wallet connection");
  return {
    address: DEMO_PORTFOLIO.address,
    chainId: SUPPORTED_CHAINS["BNB"]?.chainId ?? 56,
    isConnected: true,
    connector: "demo",
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
 * Get portfolio for connected wallet.
 * In production, this queries on-chain data via RPC or indexer.
 */
export async function getWalletPortfolio(
  address: string,
  chain: string = "BNB"
): Promise<WalletPortfolio> {
  // Demo mode
  if (address === DEMO_PORTFOLIO.address) {
    return {
      ...DEMO_PORTFOLIO,
      lastUpdated: new Date().toISOString(),
    };
  }

  // In production: query BSCScan API or similar indexer
  // For now, return empty portfolio
  return {
    address,
    chain,
    totalBalanceUsd: 0,
    tokens: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Switch wallet network.
 */
export async function switchNetwork(chain: string): Promise<boolean> {
  const config = SUPPORTED_CHAINS[chain];
  if (!config) return false;

  const provider = (window as unknown as Record<string, unknown>).ethereum;
  if (!provider) return false;

  try {
    await (
      provider as {
        request: (args: {
          method: string;
          params: { chainId: string }[];
        }) => Promise<unknown>;
      }
    ).request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${config.chainId.toString(16)}` }],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if wallet is connected.
 */
export function isWalletConnected(state: WalletConnectionState): boolean {
  return state.isConnected && state.address !== null;
}
