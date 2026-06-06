/**
 * BSC RPC Helpers
 *
 * JSON-RPC calls via Trust Wallet's window.ethereum provider.
 * Falls back to public BSC RPC endpoint when no injected provider is available.
 */

import type { TransactionRequest, SignedTransaction } from "./types";

const BSC_RPC_URL = "https://bsc-dataseed.binance.org";

// ─── Provider Detection ─────────────────────────────────

function getProvider(): {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
} | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as Record<string, unknown>).ethereum as {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  } | null;
}

// ─── RPC via fetch (fallback) ──────────────────────────

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(BSC_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC error: ${response.status}`);
  }

  const data = (await response.json()) as {
    result?: T;
    error?: { message: string };
  };

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.result as T;
}

// ─── Unified RPC (provider or fetch) ────────────────────

async function ethCall<T>(method: string, params: unknown[]): Promise<T> {
  const provider = getProvider();
  if (provider) {
    return (await provider.request({ method, params })) as T;
  }
  return rpcCall<T>(method, params);
}

// ─── Transaction Helpers ───────────────────────────────

/**
 * Get transaction receipt. Returns null if pending.
 */
export async function getTransactionReceipt(
  txHash: string
): Promise<{
  status: "0x0" | "0x1";
  blockNumber: string;
  gasUsed: string;
  logs: unknown[];
} | null> {
  return ethCall("eth_getTransactionReceipt", [txHash]);
}

/**
 * Get transaction status.
 */
export async function getTransactionStatus(
  txHash: string
): Promise<"pending" | "confirmed" | "failed"> {
  const receipt = await getTransactionReceipt(txHash);
  if (!receipt) return "pending";
  return receipt.status === "0x1" ? "confirmed" : "failed";
}

/**
 * Estimate gas for a transaction.
 */
export async function estimateGas(tx: TransactionRequest): Promise<string> {
  const params: Record<string, string> = {
    from: tx.from,
    to: tx.to,
    data: tx.data ?? "0x",
  };
  if (tx.value) params.value = "0x" + BigInt(tx.value).toString(16);

  return ethCall<string>("eth_estimateGas", [params]);
}

/**
 * Get current gas price.
 */
export async function getGasPrice(): Promise<string> {
  return ethCall<string>("eth_gasPrice", []);
}

/**
 * Get transaction count (nonce) for an address.
 */
export async function getNonce(address: string): Promise<number> {
  const result = await ethCall<string>("eth_getTransactionCount", [
    address,
    "latest",
  ]);
  return Number(BigInt(result));
}

/**
 * Send a raw transaction via Trust Wallet.
 */
export async function sendTransaction(
  tx: TransactionRequest
): Promise<SignedTransaction> {
  const provider = getProvider();
  if (!provider) {
    throw new Error("No wallet provider available");
  }

  const txParams: Record<string, string> = {
    from: tx.from,
    to: tx.to,
    data: tx.data ?? "0x",
  };
  if (tx.value) txParams.value = "0x" + BigInt(tx.value).toString(16);
  if (tx.gasLimit) txParams.gas = "0x" + BigInt(tx.gasLimit).toString(16);
  if (tx.gasPrice)
    txParams.gasPrice = "0x" + BigInt(tx.gasPrice).toString(16);

  const txHash = (await provider.request({
    method: "eth_sendTransaction",
    params: [txParams],
  })) as string;

  return {
    rawTransaction: JSON.stringify(txParams),
    txHash,
  };
}

/**
 * Make an eth_call (read-only, no gas cost).
 */
export async function ethCallContract(
  to: string,
  data: string,
  from?: string
): Promise<string> {
  const params: Record<string, string> = { to, data };
  if (from) params.from = from;
  return ethCall<string>("eth_call", [params, "latest"]);
}
