/**
 * Trust Wallet Portfolio Service
 *
 * Dedicated module for portfolio retrieval logic.
 * Extracted from connect.ts for better separation of concerns.
 */

import type { WalletPortfolio, WalletToken } from "./types";
import { SUPPORTED_CHAINS } from "./types";

// ─── Demo Portfolio (for hackathon demo) ─────────────────

const DEMO_PORTFOLIO: WalletPortfolio = {
  address: "0x742d35Cc6634C0532924a3b844Bc9e7595f2bD18",
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

// ─── Portfolio Retrieval ─────────────────────────────────

/**
 * Get portfolio for a wallet address.
 * Returns demo portfolio for the demo address,
 * empty portfolio for unknown addresses.
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
 * Get portfolio with on-chain data (production).
 * This would query RPC nodes or indexer APIs.
 */
export async function getOnChainPortfolio(
  address: string,
  chain: string = "BNB"
): Promise<WalletPortfolio> {
  const chainConfig = SUPPORTED_CHAINS[chain];
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  // In production:
  // 1. Query BSCScan API for token balances
  // 2. Fetch prices from CoinMarketCap
  // 3. Calculate USD values

  // For now, fall back to standard portfolio
  return getWalletPortfolio(address, chain);
}

/**
 * Refresh portfolio data (force re-fetch).
 */
export async function refreshPortfolio(
  address: string,
  chain: string = "BNB"
): Promise<WalletPortfolio> {
  // In production: bypass cache, re-fetch from chain
  return getWalletPortfolio(address, chain);
}
