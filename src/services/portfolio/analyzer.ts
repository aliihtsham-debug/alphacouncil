/**
 * Portfolio Analysis Service
 *
 * Analyzes wallet holdings and computes risk metrics.
 */

import type {
  WalletPortfolio,
  WalletToken,
} from "@/services/trust-wallet/types";
import type {
  PortfolioAnalysis,
  TokenHolding,
  SectorAllocation,
  PortfolioRiskMetrics,
} from "@/types/portfolio";

// ─── Sector Classification ───────────────────────────────

const SECTOR_MAP: Record<string, string> = {
  BNB: "Layer1",
  ETH: "Layer1",
  SOL: "Layer1",
  DOT: "Layer1",
  AVAX: "Layer1",
  MATIC: "Layer1",
  POL: "Layer2",
  ARB: "Layer2",
  OP: "Layer2",
  FET: "AI",
  AGIX: "AI",
  OCEAN: "AI",
  NMR: "AI",
  AAVE: "DeFi",
  UNI: "DeFi",
  CAKE: "DeFi",
  COMP: "DeFi",
  MKR: "DeFi",
  LINK: "Infrastructure",
  GRT: "Infrastructure",
  FIL: "Infrastructure",
  USDT: "Stablecoin",
  USDC: "Stablecoin",
  BUSD: "Stablecoin",
  DAI: "Stablecoin",
  TUSD: "Stablecoin",
  AXS: "Gaming",
  SAND: "Gaming",
  MANA: "Gaming",
  ENJ: "Gaming",
  PEPE: "Meme",
  DOGE: "Meme",
  SHIB: "Meme",
  FLOKI: "Meme",
};

function classifySector(symbol: string): string {
  return SECTOR_MAP[symbol.toUpperCase()] ?? "Other";
}

// ─── Analysis Functions ──────────────────────────────────

/**
 * Analyze a wallet portfolio and return structured analysis.
 */
export function analyzePortfolio(portfolio: WalletPortfolio): PortfolioAnalysis {
  const assets: TokenHolding[] = portfolio.tokens.map((token) => ({
    tokenSymbol: token.symbol,
    tokenName: token.name,
    contractAddress: token.contractAddress,
    amount: parseFloat(token.balance),
    valueUsd: token.balanceUsd,
    allocationPct:
      portfolio.totalBalanceUsd > 0
        ? token.balanceUsd / portfolio.totalBalanceUsd
        : 0,
    sector: classifySector(token.symbol),
    priceChange24h: token.percentChange24h,
  }));

  // Sort by value descending
  assets.sort((a, b) => b.valueUsd - a.valueUsd);

  // Sector distribution
  const sectorMap = new Map<string, number>();
  for (const asset of assets) {
    const sector = asset.sector ?? "Other";
    const current = sectorMap.get(sector) ?? 0;
    sectorMap.set(sector, current + asset.valueUsd);
  }

  const sectorDistribution: SectorAllocation[] = Array.from(
    sectorMap.entries()
  )
    .map(([sector, valueUsd]) => ({
      sector,
      valueUsd,
      allocationPct:
        portfolio.totalBalanceUsd > 0
          ? valueUsd / portfolio.totalBalanceUsd
          : 0,
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd);

  // Stablecoin ratio
  const stablecoinValue = assets
    .filter((a) => a.sector === "Stablecoin")
    .reduce((sum, a) => sum + a.valueUsd, 0);
  const stablecoinRatio =
    portfolio.totalBalanceUsd > 0
      ? stablecoinValue / portfolio.totalBalanceUsd
      : 0;

  // Concentration risk (Herfindahl index)
  const concentrationRisk = assets.reduce(
    (sum, a) => sum + a.allocationPct * a.allocationPct,
    0
  );

  // Overall risk score
  const riskScore = calculateRiskScore(assets, concentrationRisk, stablecoinRatio);

  return {
    totalValueUsd: portfolio.totalBalanceUsd,
    stablecoinRatio,
    riskScore,
    concentrationRisk,
    assets,
    sectorDistribution,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Calculate overall risk score (0-100).
 */
function calculateRiskScore(
  assets: TokenHolding[],
  concentrationRisk: number,
  stablecoinRatio: number
): number {
  let score = 0;

  // Concentration component (0-40 points)
  // Higher concentration = higher risk
  score += Math.min(concentrationRisk * 100, 40);

  // Volatility component (0-30 points)
  // Based on average 24h price change magnitude
  const avgVolatility =
    assets.reduce((sum, a) => sum + Math.abs(a.priceChange24h ?? 0), 0) /
    Math.max(assets.length, 1);
  score += Math.min(avgVolatility * 2, 30);

  // Stablecoin buffer (0-20 points)
  // More stablecoins = lower risk
  score += Math.max(0, 20 - stablecoinRatio * 100);

  // Diversification (0-10 points)
  // More sectors = lower risk
  const sectors = new Set(assets.map((a) => a.sector)).size;
  score += Math.max(0, 10 - sectors * 2);

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Get detailed risk metrics.
 */
export function getRiskMetrics(analysis: PortfolioAnalysis): PortfolioRiskMetrics {
  const largestHolding = analysis.assets[0];
  const sectors = new Set(analysis.assets.map((a) => a.sector));

  // Estimate portfolio volatility from weighted average of 24h changes
  const volatilityEstimate =
    analysis.assets.reduce((sum, a) => {
      return sum + Math.abs(a.priceChange24h ?? 0) * a.allocationPct;
    }, 0);

  let riskLevel: "low" | "medium" | "high" | "extreme";
  if (analysis.riskScore <= 25) riskLevel = "low";
  else if (analysis.riskScore <= 50) riskLevel = "medium";
  else if (analysis.riskScore <= 75) riskLevel = "high";
  else riskLevel = "extreme";

  return {
    riskScore: analysis.riskScore,
    riskLevel,
    concentrationRisk: analysis.concentrationRisk,
    stablecoinRatio: analysis.stablecoinRatio,
    largestHoldingPct: largestHolding?.allocationPct ?? 0,
    sectorCount: sectors.size,
    volatilityEstimate,
  };
}
