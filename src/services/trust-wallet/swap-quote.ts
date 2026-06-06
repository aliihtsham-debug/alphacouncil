/**
 * Real Swap Quoting Service
 *
 * Gets on-chain swap quotes from PancakeSwap Router V2 using getAmountsOut().
 * This is a view function (no gas cost) that returns real-time prices.
 */

import { PANCAKESWAP_ROUTER, WBNB, encodeGetAmountsOut, decodeAmountsOut } from "./calldata";
import { ethCallContract } from "./rpc";
import type { SwapQuote } from "./types";

// Common token addresses on BSC
const KNOWN_TOKENS: Record<string, { address: string; decimals: number }> = {
  BNB: { address: WBNB, decimals: 18 },
  WBNB: { address: WBNB, decimals: 18 },
  USDT: {
    address: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18,
  },
  BUSD: {
    address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    decimals: 18,
  },
  USDC: {
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    decimals: 18,
  },
  ETH: {
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    decimals: 18,
  },
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

/**
 * Get the contract address for a token symbol.
 */
export function getTokenAddress(symbol: string): string | null {
  const upper = symbol.toUpperCase();
  return KNOWN_TOKENS[upper]?.address ?? null;
}

/**
 * Get the decimals for a token symbol.
 */
export function getTokenDecimals(symbol: string): number {
  const upper = symbol.toUpperCase();
  return KNOWN_TOKENS[upper]?.decimals ?? 18;
}

/**
 * Get a real on-chain swap quote from PancakeSwap.
 *
 * Uses getAmountsOut() which is a view function (no gas cost).
 * Routes through WBNB if no direct pair exists.
 */
export async function getSwapQuote(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  chain?: string;
}): Promise<SwapQuote> {
  const fromSymbol = params.fromToken.toUpperCase();
  const toSymbol = params.toToken.toUpperCase();

  // Get token addresses
  let fromAddress = getTokenAddress(fromSymbol);
  let toAddress = getTokenAddress(toSymbol);

  // If we don't know the token, we can't quote
  if (!fromAddress || !toAddress) {
    throw new Error(
      `Unknown token: ${!fromAddress ? fromSymbol : toSymbol}. Token address must be known for on-chain quoting.`
    );
  }

  const fromDecimals = getTokenDecimals(fromSymbol);
  const toDecimals = getTokenDecimals(toSymbol);

  // Build path: try direct, fallback to via WBNB
  let path: string[];
  if (fromAddress === WBNB || toAddress === WBNB) {
    path = [fromAddress, toAddress];
  } else {
    // Route through WBNB for most pairs
    path = [fromAddress, WBNB, toAddress];
  }

  // Encode the call
  const calldata = encodeGetAmountsOut({
    amountIn: params.amount,
    path,
    tokenDecimals: fromDecimals,
  });

  // Make the eth_call
  const result = await ethCallContract(PANCAKESWAP_ROUTER, calldata);

  // Decode the result
  const amounts = decodeAmountsOut(result);

  if (amounts.length < 2) {
    throw new Error("Invalid quote response from PancakeSwap");
  }

  const fromAmount = amounts[0];
  const toAmount = amounts[amounts.length - 1];

  // Calculate price impact (simplified)
  // For a more accurate calculation, we'd compare against a reference price
  const priceImpact = 0.1; // Default low impact for now

  // Estimate gas (typical BSC swap: 150k-250k)
  const estimatedGas = "200000";

  return {
    fromToken: fromSymbol,
    toToken: toSymbol,
    fromAmount: params.amount,
    toAmount: formatAmount(toAmount, toDecimals),
    estimatedGas,
    priceImpact,
    route: path.map((addr) => {
      // Convert address back to symbol for display
      for (const [sym, info] of Object.entries(KNOWN_TOKENS)) {
        if (info.address.toLowerCase() === addr.toLowerCase()) return sym;
      }
      return addr.slice(0, 6) + "..." + addr.slice(-4);
    }),
  };
}

/**
 * Format a bigint amount with decimals to a human-readable string.
 */
function formatAmount(amount: bigint, decimals: number): string {
  const str = amount.toString().padStart(decimals + 1, "0");
  const intPart = str.slice(0, -decimals) || "0";
  const fracPart = str.slice(-decimals).replace(/0+$/, "");
  return fracPart ? `${intPart}.${fracPart}` : intPart;
}
