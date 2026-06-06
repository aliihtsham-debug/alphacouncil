/**
 * Trust Wallet Portfolio Service
 *
 * Fetches real on-chain portfolio data using BSCScan API for balances
 * and CoinMarketCap + PancakeSwap for prices.
 */

import type { WalletPortfolio, WalletToken } from "./types";
import { getBNBBalance, getAllTokenBalances } from "./bscscan";
import { getTokenPricesWithFallback } from "./price-fetcher";

/**
 * Get the real portfolio for a wallet address.
 * Fetches BNB balance, BEP-20 token balances, and current prices.
 */
export async function getWalletPortfolio(
  address: string,
  chain: string = "BNB"
): Promise<WalletPortfolio> {
  if (chain !== "BNB") {
    throw new Error(
      `Unsupported chain: ${chain}. Only BSC is currently supported.`
    );
  }

  const tokens: WalletToken[] = [];

  // 1. Fetch BNB balance
  try {
    const bnbBalanceWei = await getBNBBalance(address);
    const bnbBalance = Number(BigInt(bnbBalanceWei)) / 1e18;

    if (bnbBalance > 0) {
      tokens.push({
        contractAddress: null,
        symbol: "BNB",
        name: "BNB",
        decimals: 18,
        balance: bnbBalance.toString(),
        balanceUsd: 0, // Will be calculated after price fetch
        priceUsd: 0,
        percentChange24h: null,
      });
    }
  } catch (error) {
    console.error("Failed to fetch BNB balance:", error);
  }

  // 2. Fetch BEP-20 token balances
  try {
    const tokenBalances = await getAllTokenBalances(address);

    for (const token of tokenBalances) {
      const balanceNum =
        Number(BigInt(token.balance)) / Math.pow(10, token.decimals);

      if (balanceNum > 0) {
        tokens.push({
          contractAddress: token.contractAddress,
          symbol: token.tokenSymbol,
          name: token.tokenName,
          decimals: token.decimals,
          balance: balanceNum.toString(),
          balanceUsd: 0,
          priceUsd: 0,
          percentChange24h: null,
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch token balances:", error);
  }

  // 3. Fetch prices for all tokens
  if (tokens.length > 0) {
    const symbols = tokens.map((t) => t.symbol);
    try {
      const prices = await getTokenPricesWithFallback(symbols);

      for (const token of tokens) {
        const priceData = prices[token.symbol.toUpperCase()];
        if (priceData) {
          token.priceUsd = priceData.priceUsd;
          token.percentChange24h = priceData.percentChange24h;
          token.balanceUsd = parseFloat(token.balance) * priceData.priceUsd;
        }
      }
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    }
  }

  // 4. Filter out tokens with no price data and negligible value
  const validTokens = tokens.filter(
    (t) => t.priceUsd > 0 && t.balanceUsd > 0.01
  );

  // 5. Calculate total
  const totalBalanceUsd = validTokens.reduce(
    (sum, t) => sum + t.balanceUsd,
    0
  );

  return {
    address,
    chain,
    totalBalanceUsd,
    tokens: validTokens.sort((a, b) => b.balanceUsd - a.balanceUsd),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get portfolio with on-chain data (alias for getWalletPortfolio).
 */
export async function getOnChainPortfolio(
  address: string,
  chain: string = "BNB"
): Promise<WalletPortfolio> {
  return getWalletPortfolio(address, chain);
}

/**
 * Refresh portfolio data (force re-fetch).
 */
export async function refreshPortfolio(
  address: string,
  chain: string = "BNB"
): Promise<WalletPortfolio> {
  return getWalletPortfolio(address, chain);
}
