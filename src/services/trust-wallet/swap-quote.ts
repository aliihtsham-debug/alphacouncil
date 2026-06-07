/**
 * Real Swap Quoting Service
 *
 * Gets on-chain swap quotes from PancakeSwap Router V2 using getAmountsOut().
 * This is a view function (no gas cost) that returns real-time prices.
 *
 * Features:
 * - Multi-hop routing: tries direct pair, then via WBNB/USDT/ETH
 * - Real price impact calculation
 * - Slippage tolerance validation with warnings
 */

import {
  PANCAKESWAP_ROUTER,
  WBNB,
  encodeGetAmountsOut,
  decodeAmountsOut,
} from "./calldata";
import { ethCallContract } from "./rpc";
import type { SwapQuote } from "./types";

// ─── Token Registry ──────────────────────────────────────

interface TokenInfo {
  address: string;
  decimals: number;
}

// Common token addresses on BSC
const KNOWN_TOKENS: Record<string, TokenInfo> = {
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

// Intermediate tokens to try for multi-hop routing (in priority order)
const INTERMEDIATE_TOKENS: string[] = [WBNB, KNOWN_TOKENS.USDT.address, KNOWN_TOKENS.ETH.address, KNOWN_TOKENS.BUSD.address];

// ─── Token Lookup Helpers ────────────────────────────────

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

// ─── Slippage Validation ─────────────────────────────────

const MIN_SLIPPAGE = 0.1; // 0.1% minimum
const MAX_SLIPPAGE = 50; // 50% maximum
const HIGH_SLIPPAGE_THRESHOLD = 2; // Warn above 2%
const HIGH_PRICE_IMPACT_THRESHOLD = 5; // Warn above 5%

/**
 * Validate and clamp slippage tolerance.
 * Returns the clamped value and a warning if the input was out of range.
 */
function validateSlippage(slippage: number): {
  value: number;
  warning?: string;
} {
  if (slippage < MIN_SLIPPAGE) {
    return {
      value: MIN_SLIPPAGE,
      warning: `Slippage tolerance too low (${slippage}%). Clamped to ${MIN_SLIPPAGE}%.`,
    };
  }
  if (slippage > MAX_SLIPPAGE) {
    return {
      value: MAX_SLIPPAGE,
      warning: `Slippage tolerance too high (${slippage}%). Clamped to ${MAX_SLIPPAGE}%.`,
    };
  }
  if (slippage > HIGH_SLIPPAGE_THRESHOLD) {
    return {
      value: slippage,
      warning: `High slippage tolerance (${slippage}%). You may receive significantly less than expected.`,
    };
  }
  return { value: slippage };
}

// ─── Route Finding ───────────────────────────────────────

interface RouteOption {
  path: string[];
  expectedOutput: bigint;
  priceImpact: number;
  hopCount: number;
}

/**
 * Build candidate paths for a token pair.
 * For BNB pairs, uses direct path.
 * For token pairs, tries direct + multiple intermediaries.
 */
function buildCandidatePaths(
  fromAddress: string,
  toAddress: string
): string[][] {
  const isFromBNB = fromAddress === WBNB;
  const isToBNB = toAddress === WBNB;

  // BNB → Token or Token → BNB: direct path only
  if (isFromBNB || isToBNB) {
    return [[fromAddress, toAddress]];
  }

  // Token → Token: try direct + via each intermediary
  const paths: string[][] = [];

  // 1. Direct pair
  paths.push([fromAddress, toAddress]);

  // 2. Via each intermediate token
  for (const intermediate of INTERMEDIATE_TOKENS) {
    // Skip if intermediate is same as from or to
    if (
      intermediate === fromAddress ||
      intermediate === toAddress
    ) {
      continue;
    }
    paths.push([fromAddress, intermediate, toAddress]);
  }

  return paths;
}

/**
 * Query a single route via getAmountsOut.
 * Returns null if the route has no liquidity.
 */
async function queryRoute(
  path: string[],
  amountIn: string,
  fromDecimals: number
): Promise<RouteOption | null> {
  try {
    const calldata = encodeGetAmountsOut({
      amountIn,
      path,
      tokenDecimals: fromDecimals,
    });

    const result = await ethCallContract(PANCAKESWAP_ROUTER, calldata);
    const amounts = decodeAmountsOut(result);

    if (amounts.length < path.length) {
      return null;
    }

    const expectedOutput = amounts[amounts.length - 1];

    // Zero output means no liquidity
    if (expectedOutput === BigInt(0)) {
      return null;
    }

    return {
      path,
      expectedOutput,
      priceImpact: 0, // Will be calculated after selection
      hopCount: path.length - 1,
    };
  } catch {
    // Route failed — no liquidity or invalid pair
    return null;
  }
}

/**
 * Calculate price impact by comparing output for amount vs 1% of amount.
 * A larger swap relative to pool depth will show higher impact.
 */
async function calculatePriceImpact(
  path: string[],
  amountIn: string,
  fromDecimals: number,
  actualOutput: bigint,
  toDecimals: number
): Promise<number> {
  try {
    // Query with 1% of the input amount
    const smallAmount = (parseAmount(amountIn, fromDecimals) / BigInt(100)).toString();
    if (BigInt(smallAmount) === BigInt(0)) return 0;

    const calldata = encodeGetAmountsOut({
      amountIn: smallAmount,
      path,
      tokenDecimals: fromDecimals,
    });

    const result = await ethCallContract(PANCAKESWAP_ROUTER, calldata);
    const amounts = decodeAmountsOut(result);

    if (amounts.length < path.length) return 0;

    const smallOutput = amounts[amounts.length - 1];
    if (smallOutput === BigInt(0)) return 0;

    // Scale the small output up by 100x to compare with actual output
    const scaledSmallOutput = smallOutput * BigInt(100);

    // Price impact = 1 - (actualOutput / scaledSmallOutput)
    // If actual < scaled, there's slippage from pool depth
    if (scaledSmallOutput === BigInt(0)) return 0;

    const impactBps =
      Number((scaledSmallOutput - actualOutput) * BigInt(10000) / scaledSmallOutput) / 100;

    return Math.max(0, impactBps);
  } catch {
    return 0;
  }
}

/**
 * Find the best route among all candidates.
 * Selects the route with the highest output amount.
 * Breaks ties by preferring fewer hops.
 */
async function findBestRoute(
  fromAddress: string,
  toAddress: string,
  amountIn: string,
  fromDecimals: number,
  toDecimals: number
): Promise<RouteOption> {
  const candidatePaths = buildCandidatePaths(fromAddress, toAddress);

  // Query all routes in parallel
  const results = await Promise.allSettled(
    candidatePaths.map((path) => queryRoute(path, amountIn, fromDecimals))
  );

  const validRoutes: RouteOption[] = [];
  for (const result of results) {
    if (result.status === "fulfilled" && result.value !== null) {
      validRoutes.push(result.value);
    }
  }

  if (validRoutes.length === 0) {
    throw new Error(
      `No liquidity found for this token pair. The tokens may not have a trading pair on PancakeSwap.`
    );
  }

  // Sort by output (descending), then by hop count (ascending) as tiebreaker
  validRoutes.sort((a, b) => {
    if (a.expectedOutput !== b.expectedOutput) {
      return a.expectedOutput > b.expectedOutput ? -1 : 1;
    }
    return a.hopCount - b.hopCount;
  });

  const bestRoute = validRoutes[0];

  // Calculate actual price impact for the best route
  bestRoute.priceImpact = await calculatePriceImpact(
    bestRoute.path,
    amountIn,
    fromDecimals,
    bestRoute.expectedOutput,
    toDecimals
  );

  return bestRoute;
}

// ─── Public API ──────────────────────────────────────────

/**
 * Get a real on-chain swap quote from PancakeSwap.
 *
 * Uses getAmountsOut() which is a view function (no gas cost).
 * Tries multiple routes (direct, via WBNB, USDT, ETH, BUSD) and
 * selects the one with the best output.
 */
export async function getSwapQuote(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
  chain?: string;
}): Promise<SwapQuote> {
  const fromSymbol = params.fromToken.toUpperCase();
  const toSymbol = params.toToken.toUpperCase();

  // Validate slippage
  const slippageValidation = validateSlippage(params.slippage ?? 0.5);
  const slippageTolerance = slippageValidation.value;

  // Get token addresses
  const fromAddress = getTokenAddress(fromSymbol);
  const toAddress = getTokenAddress(toSymbol);

  if (!fromAddress || !toAddress) {
    throw new Error(
      `Unknown token: ${!fromAddress ? fromSymbol : toSymbol}. Token address must be known for on-chain quoting.`
    );
  }

  const fromDecimals = getTokenDecimals(fromSymbol);
  const toDecimals = getTokenDecimals(toSymbol);

  // Find the best route
  const bestRoute = await findBestRoute(
    fromAddress,
    toAddress,
    params.amount,
    fromDecimals,
    toDecimals
  );

  // Calculate minimum received with slippage tolerance
  const slippageMultiplier = BigInt(
    Math.floor((100 - slippageTolerance) * 100)
  );
  const minimumReceivedRaw =
    (bestRoute.expectedOutput * slippageMultiplier) / BigInt(10000);

  // Build warnings
  const warnings: string[] = [];
  if (slippageValidation.warning) {
    warnings.push(slippageValidation.warning);
  }
  if (bestRoute.priceImpact > HIGH_PRICE_IMPACT_THRESHOLD) {
    warnings.push(
      `High price impact (${bestRoute.priceImpact.toFixed(2)}%). This trade will significantly move the market price.`
    );
  }
  if (bestRoute.hopCount > 1) {
    warnings.push(
      `Multi-hop route (${bestRoute.hopCount} hops). Higher gas cost and more slippage risk.`
    );
  }

  // Estimate gas based on hop count
  const baseGas = 150000;
  const gasPerHop = 50000;
  const estimatedGas = String(baseGas + (bestRoute.hopCount - 1) * gasPerHop);

  return {
    fromToken: fromSymbol,
    toToken: toSymbol,
    fromAmount: params.amount,
    toAmount: formatAmount(bestRoute.expectedOutput, toDecimals),
    estimatedGas,
    priceImpact: bestRoute.priceImpact,
    route: bestRoute.path.map((addr) => {
      // Convert address back to symbol for display
      for (const [sym, info] of Object.entries(KNOWN_TOKENS)) {
        if (info.address.toLowerCase() === addr.toLowerCase()) return sym;
      }
      return addr.slice(0, 6) + "..." + addr.slice(-4);
    }),
    slippageTolerance,
    minimumReceived: formatAmount(minimumReceivedRaw, toDecimals),
    warning: warnings.length > 0 ? warnings.join(" ") : undefined,
  };
}

// ─── Helpers ─────────────────────────────────────────────

/**
 * Parse a human-readable amount string to a bigint with decimals.
 */
function parseAmount(amount: string, decimals: number): bigint {
  const [intPart, fracPart = ""] = amount.split(".");
  const paddedFrac = fracPart.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(intPart + paddedFrac);
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
