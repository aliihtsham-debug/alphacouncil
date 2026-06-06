/**
 * Trust Wallet Transaction Service
 *
 * Real on-chain swap execution via Trust Wallet's window.ethereum provider.
 * Uses PancakeSwap Router V2 on BSC for actual token swaps.
 */

import type { TransactionRequest, SwapQuote, SignedTransaction } from "./types";
import { PANCAKESWAP_ROUTER, WBNB } from "./calldata";
import {
  encodeSwapExactTokensForTokens,
  encodeSwapExactETHForTokens,
  encodeSwapExactTokensForETH,
} from "./calldata";
import { getSwapQuote, getTokenAddress, getTokenDecimals } from "./swap-quote";
import {
  getTransactionStatus,
  estimateGas,
  getGasPrice,
  sendTransaction,
} from "./rpc";

// ─── Swap Quote ─────────────────────────────────────────

/**
 * Get a real on-chain swap quote from PancakeSwap.
 */
export async function getSwapQuote(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  chain?: string;
}): Promise<SwapQuote> {
  return getSwapQuote(params);
}

// ─── Transaction Signing & Sending ──────────────────────

/**
 * Sign and send a transaction via Trust Wallet.
 * Returns the real txHash from the wallet.
 */
export async function signTransaction(
  tx: TransactionRequest
): Promise<SignedTransaction> {
  return sendTransaction(tx);
}

// ─── Swap Execution ─────────────────────────────────────

/**
 * Execute a real swap through PancakeSwap via Trust Wallet.
 *
 * Flow:
 * 1. Get on-chain quote from PancakeSwap
 * 2. Calculate amountOutMin with slippage tolerance
 * 3. Encode swap calldata
 * 4. Estimate gas
 * 5. Send transaction via Trust Wallet
 * 6. Return real txHash
 */
export async function executeSwap(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
  walletAddress: string;
}): Promise<{
  success: boolean;
  txHash: string;
  fromAmount: string;
  toAmount: string;
}> {
  const fromSymbol = params.fromToken.toUpperCase();
  const toSymbol = params.toToken.toUpperCase();
  const slippage = params.slippage ?? 0.5; // 0.5% default slippage

  // Get real quote
  const quote = await getSwapQuote({
    fromToken: fromSymbol,
    toToken: toSymbol,
    amount: params.amount,
  });

  // Calculate minimum output with slippage tolerance
  const toDecimals = getTokenDecimals(toSymbol);
  const toAmountRaw = parseAmount(quote.toAmount, toDecimals);
  const slippageMultiplier = BigInt(Math.floor((100 - slippage) * 100));
  const amountOutMin = (toAmountRaw * slippageMultiplier) / BigInt(10000);

  // Get token addresses
  const fromAddress = getTokenAddress(fromSymbol);
  const toAddress = getTokenAddress(toSymbol);

  if (!fromAddress || !toAddress) {
    throw new Error(
      `Unknown token address: ${!fromAddress ? fromSymbol : toSymbol}`
    );
  }

  // Build swap path
  const isFromBNB = fromSymbol === "BNB" || fromSymbol === "WBNB";
  const isToBNB = toSymbol === "BNB" || toSymbol === "WBNB";

  let path: string[];
  if (isFromBNB) {
    path = [WBNB, toAddress];
  } else if (isToBNB) {
    path = [fromAddress, WBNB];
  } else {
    // Route through WBNB
    path = [fromAddress, WBNB, toAddress];
  }

  // Deadline: 20 minutes from now
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

  // Encode calldata based on swap type
  let calldata: string;
  let value = "0";

  if (isFromBNB) {
    // BNB → Token
    calldata = encodeSwapExactETHForTokens({
      amountOutMin: amountOutMin.toString(),
      path,
      to: params.walletAddress,
      deadline,
      outDecimals: toDecimals,
    });
    value = parseAmount(params.amount, 18).toString();
  } else if (isToBNB) {
    // Token → BNB
    const fromDecimals = getTokenDecimals(fromSymbol);
    calldata = encodeSwapExactTokensForETH({
      amountIn: params.amount,
      amountOutMin: amountOutMin.toString(),
      path,
      to: params.walletAddress,
      deadline,
      tokenDecimals: fromDecimals,
    });
  } else {
    // Token → Token
    const fromDecimals = getTokenDecimals(fromSymbol);
    calldata = encodeSwapExactTokensForTokens({
      amountIn: params.amount,
      amountOutMin: amountOutMin.toString(),
      path,
      to: params.walletAddress,
      deadline,
      tokenDecimals: fromDecimals,
    });
  }

  // Estimate gas
  const gasEstimate = await estimateGas({
    from: params.walletAddress,
    to: PANCAKESWAP_ROUTER,
    data: calldata,
    value,
  });

  // Add 20% buffer to gas estimate
  const gasWithBuffer =
    (BigInt(gasEstimate) * BigInt(120)) / BigInt(100);

  // Get gas price
  const gasPrice = await getGasPrice();

  // Build transaction
  const tx: TransactionRequest = {
    from: params.walletAddress,
    to: PANCAKESWAP_ROUTER,
    data: calldata,
    value,
    gasLimit: gasWithBuffer.toString(),
    gasPrice,
  };

  // Send via Trust Wallet
  const signed = await sendTransaction(tx);

  return {
    success: true,
    txHash: signed.txHash,
    fromAmount: params.amount,
    toAmount: quote.toAmount,
  };
}

// ─── Transaction Status ─────────────────────────────────

/**
 * Check real transaction status on-chain.
 */
export async function getTransactionStatus(
  txHash: string
): Promise<"pending" | "confirmed" | "failed"> {
  return getTransactionStatus(txHash);
}

// ─── Helpers ────────────────────────────────────────────

/**
 * Parse a human-readable amount string to a bigint with decimals.
 */
function parseAmount(amount: string, decimals: number): bigint {
  const [intPart, fracPart = ""] = amount.split(".");
  const paddedFrac = fracPart.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(intPart + paddedFrac);
}
