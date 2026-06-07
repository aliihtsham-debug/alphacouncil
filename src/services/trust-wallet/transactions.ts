/**
 * Trust Wallet Transaction Service
 *
 * Real on-chain swap execution via Trust Wallet's window.ethereum provider.
 * Uses PancakeSwap Router V2 on BSC for actual token swaps.
 *
 * Features:
 * - ERC-20 token approval checks before swaps
 * - Configurable slippage tolerance with validation
 * - Multi-hop routing via swap-quote service
 * - Real price impact calculation and warnings
 */

import type { TransactionRequest, SwapQuote, SignedTransaction } from "./types";
import { PANCAKESWAP_ROUTER, WBNB, encodeApprove, MAX_UINT256 } from "./calldata";
import {
  encodeSwapExactTokensForTokens,
  encodeSwapExactETHForTokens,
  encodeSwapExactTokensForETH,
} from "./calldata";
import {
  getSwapQuote as getSwapQuoteFromRouter,
  getTokenAddress,
  getTokenDecimals,
} from "./swap-quote";
import {
  getTransactionStatus as getRpcTransactionStatus,
  estimateGas,
  getGasPrice,
  sendTransaction,
  getAllowance,
  ethCallContract,
} from "./rpc";

// ─── Swap Result ─────────────────────────────────────────

export interface SwapResult {
  success: boolean;
  txHash: string;
  fromAmount: string;
  toAmount: string;
  approvalTxHash?: string;
  warning?: string;
}

// ─── Swap Quote ─────────────────────────────────────────

/**
 * Get a real on-chain swap quote from PancakeSwap.
 * Supports multi-hop routing, slippage validation, and price impact calculation.
 */
export async function getSwapQuote(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
  chain?: string;
}): Promise<SwapQuote> {
  return getSwapQuoteFromRouter(params);
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

// ─── ERC-20 Token Approval ──────────────────────────────

/**
 * Check if the router has sufficient allowance to spend the user's tokens.
 * Returns true if no approval is needed (BNB swaps or sufficient allowance).
 */
async function checkAndApprove(
  tokenAddress: string,
  walletAddress: string,
  amountRaw: bigint
): Promise<string | undefined> {
  // Query current allowance
  let currentAllowance: bigint;
  try {
    currentAllowance = await getAllowance(
      tokenAddress,
      walletAddress,
      PANCAKESWAP_ROUTER
    );
  } catch {
    // If we can't query, assume we need to approve to be safe
    currentAllowance = BigInt(0);
  }

  // If allowance is sufficient, skip approval
  if (currentAllowance >= amountRaw) {
    return undefined;
  }

  // Approve max uint256 to avoid repeated approvals
  const approveCalldata = encodeApprove({
    spender: PANCAKESWAP_ROUTER,
    amount: MAX_UINT256.toString(),
  });

  // Estimate gas for the approval
  const gasEstimate = await estimateGas({
    from: walletAddress,
    to: tokenAddress,
    data: approveCalldata,
    value: "0",
  });

  const gasWithBuffer = (BigInt(gasEstimate) * BigInt(120)) / BigInt(100);
  const gasPrice = await getGasPrice();

  // Send the approval transaction
  const approveTx: TransactionRequest = {
    from: walletAddress,
    to: tokenAddress,
    data: approveCalldata,
    value: "0",
    gasLimit: gasWithBuffer.toString(),
    gasPrice,
  };

  const signed = await sendTransaction(approveTx);

  // Wait for approval confirmation
  const confirmed = await waitForApproval(signed.txHash);
  if (!confirmed) {
    throw new Error(
      "Token approval transaction failed or timed out. Please try again."
    );
  }

  return signed.txHash;
}

/**
 * Wait for an approval transaction to be confirmed.
 * Polls for up to 60 seconds (12 attempts * 5s).
 */
async function waitForApproval(txHash: string): Promise<boolean> {
  const maxAttempts = 12;
  const intervalMs = 5000;

  for (let i = 0; i < maxAttempts; i++) {
    await sleep(intervalMs);
    try {
      const status = await getRpcTransactionStatus(txHash);
      if (status === "confirmed") return true;
      if (status === "failed") return false;
    } catch {
      // Poll error, continue trying
    }
  }

  // Timeout — transaction might still confirm, but we can't wait longer
  return false;
}

// ─── Swap Execution ─────────────────────────────────────

/**
 * Execute a real swap through PancakeSwap via Trust Wallet.
 *
 * Flow:
 * 1. Get on-chain quote from PancakeSwap (with multi-hop routing)
 * 2. Validate slippage tolerance and check for warnings
 * 3. If swapping tokens (not BNB), check and execute ERC-20 approval
 * 4. Calculate amountOutMin with slippage tolerance
 * 5. Encode swap calldata
 * 6. Estimate gas
 * 7. Send transaction via Trust Wallet
 * 8. Return real txHash
 */
export async function executeSwap(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
  walletAddress: string;
}): Promise<SwapResult> {
  const fromSymbol = params.fromToken.toUpperCase();
  const toSymbol = params.toToken.toUpperCase();

  // Clamp slippage to valid range [0.1, 50]
  const rawSlippage = params.slippage ?? 0.5;
  const slippage = Math.min(50, Math.max(0.1, rawSlippage));

  // 1. Get the best quote (multi-hop routing, price impact, etc.)
  const quote = await getSwapQuote({
    fromToken: fromSymbol,
    toToken: toSymbol,
    amount: params.amount,
    slippage,
  });

  // 2. Get token addresses
  const fromAddress = getTokenAddress(fromSymbol);
  const toAddress = getTokenAddress(toSymbol);

  if (!fromAddress || !toAddress) {
    throw new Error(
      `Unknown token address: ${!fromAddress ? fromSymbol : toSymbol}`
    );
  }

  // 3. Determine swap type
  const isFromBNB = fromSymbol === "BNB" || fromSymbol === "WBNB";
  const isToBNB = toSymbol === "BNB" || toSymbol === "WBNB";

  // 4. If swapping tokens (not BNB), check and execute ERC-20 approval
  let approvalTxHash: string | undefined;
  if (!isFromBNB) {
    const fromDecimals = getTokenDecimals(fromSymbol);
    const amountRaw = parseAmount(params.amount, fromDecimals);
    approvalTxHash = await checkAndApprove(
      fromAddress,
      params.walletAddress,
      amountRaw
    );
  }

  // 5. Use the route from the quote
  const path = quote.route.map((routeSymbol) => {
    // Map symbol back to address — route from quote uses display symbols
    const addr = getTokenAddress(routeSymbol);
    if (addr) return addr;
    // If not a known symbol, it might be the address itself
    if (routeSymbol.startsWith("0x")) return routeSymbol;
    throw new Error(`Unknown route symbol: ${routeSymbol}`);
  });

  const toDecimals = getTokenDecimals(toSymbol);
  const toAmountRaw = parseAmount(quote.toAmount, toDecimals);

  // 6. Calculate amountOutMin from the quoted minimum received
  const minimumReceivedRaw = parseAmount(quote.minimumReceived, toDecimals);
  const amountOutMin = minimumReceivedRaw > BigInt(0)
    ? minimumReceivedRaw
    : (toAmountRaw * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000);

  // 7. Deadline: 20 minutes from now
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

  // 8. Encode calldata based on swap type
  let calldata: string;
  let value = "0";

  const fromDecimals = getTokenDecimals(fromSymbol);

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
    calldata = encodeSwapExactTokensForTokens({
      amountIn: params.amount,
      amountOutMin: amountOutMin.toString(),
      path,
      to: params.walletAddress,
      deadline,
      tokenDecimals: fromDecimals,
    });
  }

  // 9. Estimate gas
  const gasEstimate = await estimateGas({
    from: params.walletAddress,
    to: PANCAKESWAP_ROUTER,
    data: calldata,
    value,
  });

  // Add 25% buffer to gas estimate (multi-hop swaps need more gas)
  const gasWithBuffer = (BigInt(gasEstimate) * BigInt(125)) / BigInt(100);

  // 10. Get gas price
  const gasPrice = await getGasPrice();

  // 11. Build transaction
  const tx: TransactionRequest = {
    from: params.walletAddress,
    to: PANCAKESWAP_ROUTER,
    data: calldata,
    value,
    gasLimit: gasWithBuffer.toString(),
    gasPrice,
  };

  // 12. Send via Trust Wallet
  const signed = await sendTransaction(tx);

  return {
    success: true,
    txHash: signed.txHash,
    fromAmount: params.amount,
    toAmount: quote.toAmount,
    approvalTxHash,
    warning: quote.warning,
  };
}

// ─── Transaction Status ─────────────────────────────────

/**
 * Check real transaction status on-chain.
 */
export async function getTransactionStatus(
  txHash: string
): Promise<"pending" | "confirmed" | "failed"> {
  return getRpcTransactionStatus(txHash);
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
 * Sleep utility for async polling.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
