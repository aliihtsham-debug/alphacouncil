/**
 * Real Price Fetcher
 *
 * Fetches token prices from CoinMarketCap API.
 * Falls back to PancakeSwap on-chain pricing if CMC doesn't have the token.
 */

import { cmcFetch } from "@/services/coinmarketcap/client";
import { PANCAKESWAP_ROUTER, WBNB } from "./calldata";
import { encodeGetAmountsOut, decodeAmountsOut, ethCallContract } from "./rpc";

interface PriceData {
  priceUsd: number;
  percentChange24h: number | null;
}

/**
 * Fetch prices for multiple token symbols from CoinMarketCap.
 */
export async function getTokenPrices(
  symbols: string[]
): Promise<Record<string, PriceData>> {
  if (symbols.length === 0) return {};

  const symbolList = symbols.join(",");

  const data = await cmcFetch<{
    data: Record<
      string,
      Array<{
        quote: {
          USD: {
            price: number;
            percent_change_24h: number | null;
          };
        };
      }>
    >;
  }>("v2/cryptocurrency/quotes/latest", {
    symbol: symbolList,
  });

  const result: Record<string, PriceData> = {};

  for (const [symbol, entries] of Object.entries(data.data)) {
    if (entries && entries.length > 0) {
      const quote = entries[0].quote.USD;
      result[symbol.toUpperCase()] = {
        priceUsd: quote.price,
        percentChange24h: quote.percent_change_24h,
      };
    }
  }

  return result;
}

/**
 * Get price for a single token from PancakeSwap on-chain.
 * Used as fallback when CMC doesn't have the token.
 *
 * Queries getAmountsOut with 1 token → USDT to get the price.
 */
export async function getOnChainPrice(
  tokenAddress: string,
  tokenSymbol: string,
  decimals: number = 18
): Promise<PriceData> {
  const USDT = "0x55d398326f99059fF775485246999027B3197955";

  // If it's USDT itself, return $1
  if (
    tokenSymbol.toUpperCase() === "USDT" ||
    tokenAddress.toLowerCase() === USDT.toLowerCase()
  ) {
    return { priceUsd: 1.0, percentChange24h: 0 };
  }

  // If it's WBNB, get BNB price
  if (
    tokenSymbol.toUpperCase() === "BNB" ||
    tokenSymbol.toUpperCase() === "WBNB" ||
    tokenAddress.toLowerCase() === WBNB.toLowerCase()
  ) {
    // Get BNB price by querying WBNB → USDT
    const calldata = encodeGetAmountsOut({
      amountIn: "1",
      path: [WBNB, USDT],
      tokenDecimals: 18,
    });
    const result = await ethCallContract(PANCAKESWAP_ROUTER, calldata);
    const amounts = decodeAmountsOut(result);
    if (amounts.length >= 2) {
      const price = Number(amounts[1]) / 1e18;
      return { priceUsd: price, percentChange24h: null };
    }
  }

  // For other tokens, try direct pair with USDT
  try {
    const calldata = encodeGetAmountsOut({
      amountIn: "1",
      path: [tokenAddress, USDT],
      tokenDecimals: decimals,
    });
    const result = await ethCallContract(PANCAKESWAP_ROUTER, calldata);
    const amounts = decodeAmountsOut(result);
    if (amounts.length >= 2) {
      const price = Number(amounts[1]) / 1e18;
      return { priceUsd: price, percentChange24h: null };
    }
  } catch {
    // Direct pair doesn't exist, try via WBNB
  }

  // Route through WBNB
  try {
    const calldata = encodeGetAmountsOut({
      amountIn: "1",
      path: [tokenAddress, WBNB, USDT],
      tokenDecimals: decimals,
    });
    const result = await ethCallContract(PANCAKESWAP_ROUTER, calldata);
    const amounts = decodeAmountsOut(result);
    if (amounts.length >= 3) {
      const price = Number(amounts[2]) / 1e18;
      return { priceUsd: price, percentChange24h: null };
    }
  } catch {
    // No liquidity
  }

  throw new Error(`Cannot determine on-chain price for ${tokenSymbol}`);
}

/**
 * Fetch prices for symbols, using CMC first and on-chain fallback.
 */
export async function getTokenPricesWithFallback(
  symbols: string[]
): Promise<Record<string, PriceData>> {
  // Try CMC first
  const cmcPrices = await getTokenPrices(symbols);

  // Find symbols that CMC didn't return
  const missing = symbols.filter(
    (s) => !cmcPrices[s.toUpperCase()]
  );

  // For missing tokens, try on-chain pricing
  if (missing.length > 0) {
    // Map of known token addresses for on-chain fallback
    const knownAddresses: Record<string, { address: string; decimals: number }> = {
      FET: {
        address: "0x031b41e504677879370e9DBcF937283A8691Fa7f",
        decimals: 18,
      },
      LINK: {
        address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
        decimals: 18,
      },
      CAKE: {
        address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
        decimals: 18,
      },
      DOT: {
        address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
        decimals: 18,
      },
      UNI: {
        address: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
        decimals: 18,
      },
      ADA: {
        address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
        decimals: 18,
      },
      XRP: {
        address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
        decimals: 18,
      },
      SOL: {
        address: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
        decimals: 18,
      },
      MATIC: {
        address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
        decimals: 18,
      },
      AVAX: {
        address: "0x1CE0c2827e2eF14D5C4f29a091d735A204794041",
        decimals: 18,
      },
      DOGE: {
        address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
        decimals: 8,
      },
      SHIB: {
        address: "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D",
        decimals: 18,
      },
      PEPE: {
        address: "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00",
        decimals: 18,
      },
    };

    for (const symbol of missing) {
      const upper = symbol.toUpperCase();
      const known = knownAddresses[upper];
      if (known) {
        try {
          const price = await getOnChainPrice(
            known.address,
            upper,
            known.decimals
          );
          cmcPrices[upper] = price;
        } catch {
          console.warn(`Could not fetch on-chain price for ${upper}`);
        }
      }
    }
  }

  return cmcPrices;
}
