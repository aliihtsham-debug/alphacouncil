/**
 * Trust Wallet integration types
 */

export interface TrustWalletConfig {
  chainId: number;
  chainName: string;
  rpcUrl: string;
}

export const SUPPORTED_CHAINS: Record<string, TrustWalletConfig> = {
  BNB: {
    chainId: 56,
    chainName: "BNB Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org",
  },
  ETH: {
    chainId: 1,
    chainName: "Ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/",
  },
  POLYGON: {
    chainId: 137,
    chainName: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
  },
};

export interface WalletConnectionState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  connector: string | null;
}

export interface WalletPortfolio {
  address: string;
  chain: string;
  totalBalanceUsd: number;
  tokens: WalletToken[];
  lastUpdated: string;
}

export interface WalletToken {
  contractAddress: string | null;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUsd: number;
  priceUsd: number;
  percentChange24h: number | null;
  logoUrl?: string;
}

export interface TransactionRequest {
  from: string;
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  priceImpact: number;
  route: string[];
}

export interface SignedTransaction {
  rawTransaction: string;
  txHash: string;
}
