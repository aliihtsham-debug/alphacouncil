/**
 * Portfolio and wallet types
 */

export interface WalletInfo {
  address: string;
  chain: string;
  isConnected: boolean;
}

export interface TokenHolding {
  tokenSymbol: string;
  tokenName: string;
  contractAddress?: string | null;
  amount: number;
  valueUsd: number;
  allocationPct: number;
  sector: string | null;
  priceChange24h: number | null;
}

export interface PortfolioAnalysis {
  totalValueUsd: number;
  stablecoinRatio: number;
  riskScore: number; // 0-100
  concentrationRisk: number; // 0-1
  assets: TokenHolding[];
  sectorDistribution: SectorAllocation[];
  analyzedAt: string;
}

export interface SectorAllocation {
  sector: string;
  valueUsd: number;
  allocationPct: number;
}

export interface PortfolioRiskMetrics {
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "extreme";
  concentrationRisk: number;
  stablecoinRatio: number;
  largestHoldingPct: number;
  sectorCount: number;
  volatilityEstimate: number;
}
