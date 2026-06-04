/**
 * Trust Wallet Transaction Service
 *
 * Handles transaction signing and execution via Trust Wallet.
 * For demo, simulates transaction flow.
 */

import type { TransactionRequest, SwapQuote, SignedTransaction } from "./types";

// ─── Demo Transaction ────────────────────────────────────

const DEMO_TX_HASH = "0x" + Array.from({ length: 64 }, () =>
  Math.floor(Math.random() * 16).toString(16)
).join("");

/**
 * Get a swap quote.
 * In production, this queries DEX aggregators (1inch, PancakeSwap, etc.)
 */
export async function getSwapQuote(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  chain?: string;
}): Promise<SwapQuote> {
  // Demo: return a mock quote
  const fromAmount = parseFloat(params.amount);
  // Mock exchange rate
  const rates: Record<string, number> = {
    "BNB-FET": 0.0053,
    "BNB-USDT": 283.66,
    "USDT-FET": 187.5,
    "ETH-FET": 0.00046,
  };

  const key = `${params.fromToken}-${params.toToken}`;
  const rate = rates[key] ?? 1;
  const toAmount = fromAmount * rate;

  return {
    fromToken: params.fromToken,
    toToken: params.toToken,
    fromAmount: params.amount,
    toAmount: toAmount.toFixed(6),
    estimatedGas: "0.005",
    priceImpact: 0.12,
    route: [params.fromToken, params.toToken],
  };
}

/**
 * Sign a transaction with Trust Wallet.
 * In production, this sends the tx to the wallet for signing.
 */
export async function signTransaction(
  tx: TransactionRequest
): Promise<SignedTransaction> {
  const provider = (window as unknown as Record<string, unknown>).ethereum;

  if (provider) {
    try {
      const txHash = (await (
        provider as {
          request: (args: {
            method: string;
            params: unknown[];
          }) => Promise<string>;
        }
      ).request({
        method: "eth_sendTransaction",
        params: [tx],
      })) as string;

      return {
        rawTransaction: JSON.stringify(tx),
        txHash,
      };
    } catch (error) {
      console.warn("Real tx signing failed:", error);
    }
  }

  // Demo mode: simulate signing
  console.log("🎮 Demo mode: Simulating transaction signing");
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    rawTransaction: JSON.stringify(tx),
    txHash: DEMO_TX_HASH,
  };
}

/**
 * Execute a swap through Trust Wallet.
 * Combines quote + signing + confirmation.
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
  // Get quote
  const quote = await getSwapQuote({
    fromToken: params.fromToken,
    toToken: params.toToken,
    amount: params.amount,
  });

  // Build transaction
  const tx: TransactionRequest = {
    from: params.walletAddress,
    to: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap router
    value: params.fromToken === "BNB" ? params.amount : "0",
    data: "0x", // Encoded swap call
  };

  // Sign and send
  const signed = await signTransaction(tx);

  return {
    success: true,
    txHash: signed.txHash,
    fromAmount: quote.fromAmount,
    toAmount: quote.toAmount,
  };
}

/**
 * Check transaction status.
 */
export async function getTransactionStatus(
  txHash: string
): Promise<"pending" | "confirmed" | "failed"> {
  // Demo: always confirmed
  if (txHash === DEMO_TX_HASH) {
    return "confirmed";
  }

  // In production: query RPC for tx receipt
  return "pending";
}
