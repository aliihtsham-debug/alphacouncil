/**
 * BSCScan API Client
 *
 * Fetches real on-chain token balances for a given BSC address.
 * Uses BSCScan's free API (5 calls/sec).
 *
 * Get a free API key at: https://bscscan.com/myapikey
 */

import { getEnv } from "@/lib/env";

const BSCSCAN_API = "https://api.bscscan.com/api";

interface BscScanResponse<T> {
  status: string;
  message: string;
  result: T;
}

/**
 * Get BNB balance for an address (in wei).
 */
export async function getBNBBalance(address: string): Promise<string> {
  const env = getEnv();
  const url = `${BSCSCAN_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${env.BSCSCAN_API_KEY}`;

  const res = await fetch(url);
  const data = (await res.json()) as BscScanResponse<string>;

  if (data.status !== "1") {
    throw new Error(`BSCScan error: ${data.message}`);
  }

  return data.result;
}

/**
 * Get all BEP-20 token transactions for an address.
 * Used to discover which tokens the address holds.
 */
export async function getTokenTransactions(
  address: string,
  startBlock = 0,
  endBlock = 999999999
): Promise<
  Array<{
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
  }>
> {
  const env = getEnv();
  const url = `${BSCSCAN_API}?module=account&action=tokentx&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=${env.BSCSCAN_API_KEY}`;

  const res = await fetch(url);
  const data = (await res.json()) as BscScanResponse<
    Array<{
      contractAddress: string;
      tokenName: string;
      tokenSymbol: string;
      tokenDecimal: string;
    }>
  >;

  if (data.status !== "1") {
    // No transactions is not an error
    if (data.message === "No transactions found") return [];
    throw new Error(`BSCScan error: ${data.message}`);
  }

  // Deduplicate by contract address
  const seen = new Set<string>();
  const tokens: Array<{
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
  }> = [];

  for (const tx of data.result) {
    const addr = tx.contractAddress.toLowerCase();
    if (!seen.has(addr)) {
      seen.add(addr);
      tokens.push(tx);
    }
  }

  return tokens;
}

/**
 * Get the balance of a specific BEP-20 token for an address.
 */
export async function getTokenBalance(
  contractAddress: string,
  walletAddress: string
): Promise<string> {
  const env = getEnv();
  const url = `${BSCSCAN_API}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${walletAddress}&tag=latest&apikey=${env.BSCSCAN_API_KEY}`;

  const res = await fetch(url);
  const data = (await res.json()) as BscScanResponse<string>;

  if (data.status !== "1") {
    return "0";
  }

  return data.result;
}

/**
 * Get all token balances for an address.
 * Returns a map of contractAddress -> balance (in token's smallest unit).
 */
export async function getAllTokenBalances(
  address: string
): Promise<
  Array<{
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    decimals: number;
    balance: string;
  }>
> {
  // First, discover tokens from transaction history
  const tokenTxs = await getTokenTransactions(address);

  // Then get current balance for each token
  const balances = await Promise.all(
    tokenTxs.map(async (token) => {
      const balance = await getTokenBalance(token.contractAddress, address);
      return {
        contractAddress: token.contractAddress,
        tokenName: token.tokenName,
        tokenSymbol: token.tokenSymbol,
        decimals: parseInt(token.tokenDecimal, 10) || 18,
        balance,
      };
    })
  );

  // Filter out zero-balance tokens
  return balances.filter((t) => {
    try {
      return BigInt(t.balance) > BigInt(0);
    } catch {
      return false;
    }
  });
}
