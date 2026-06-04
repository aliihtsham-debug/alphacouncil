/**
 * Portfolio Risk Calculation Utilities
 *
 * Extracted from analyzer.ts for better modularity.
 * Provides risk scoring, concentration metrics, and risk level classification.
 */

import type { TokenHolding, PortfolioAnalysis, PortfolioRiskMetrics } from "@/types/portfolio";

// ─── Risk Score Calculation ──────────────────────────────

/**
 * Calculate overall risk score (0-100).
 * Higher score = higher risk.
 *
 * Components:
 * - Concentration (0-40 pts): Herfindahl index scaled
 * - Volatility (0-30 pts): Average 24h price change magnitude
 * - Stablecoin buffer (0-20 pts): More stablecoins = lower risk
 * - Diversification (0-10 pts): More sectors = lower risk
 */
export function calculateRiskScore(
  assets: TokenHolding[],
  concentrationRisk: number,
  stablecoinRatio: number
): number {
  let score = 0;

  // Concentration component (0-40 points)
  score += Math.min(concentrationRisk * 100, 40);

  // Volatility component (0-30 points)
  const avgVolatility =
    assets.reduce((sum, a) => sum + Math.abs(a.priceChange24h ?? 0), 0) /
    Math.max(assets.length, 1);
  score += Math.min(avgVolatility * 2, 30);

  // Stablecoin buffer (0-20 points)
  score += Math.max(0, 20 - stablecoinRatio * 100);

  // Diversification (0-10 points)
  const sectors = new Set(assets.map((a) => a.sector)).size;
  score += Math.max(0, 10 - sectors * 2);

  return Math.round(Math.min(100, Math.max(0, score)));
}

// ─── Concentration Risk ──────────────────────────────────

/**
 * Calculate concentration risk using Herfindahl index.
 * Returns a value between 0 (perfectly diversified) and 1 (single asset).
 */
export function calculateConcentrationRisk(assets: TokenHolding[]): number {
  return assets.reduce((sum, a) => sum + a.allocationPct * a.allocationPct, 0);
}

// ─── Risk Level Classification ───────────────────────────

/**
 * Classify risk score into a human-readable level.
 */
export function getRiskLevel(score: number): "low" | "medium" | "high" | "extreme" {
  if (score <= 25) return "low";
  if (score <= 50) return "medium";
  if (score <= 75) return "high";
  return "extreme";
}

/**
 * Get color class for risk level.
 */
export function getRiskColor(level: "low" | "medium" | "high" | "extreme"): string {
  switch (level) {
    case "low":
      return "text-green-400";
    case "medium":
      return "text-yellow-400";
    case "high":
      return "text-orange-400";
    case "extreme":
      return "text-red-400";
  }
}

// ─── Full Risk Metrics ───────────────────────────────────

/**
 * Get detailed risk metrics from a portfolio analysis.
 */
export function getRiskMetrics(analysis: PortfolioAnalysis): PortfolioRiskMetrics {
  const largestHolding = analysis.assets[0];
  const sectors = new Set(analysis.assets.map((a) => a.sector));

  // Estimate portfolio volatility from weighted average of 24h changes
  const volatilityEstimate = analysis.assets.reduce((sum, a) => {
    return sum + Math.abs(a.priceChange24h ?? 0) * a.allocationPct;
  }, 0);

  const riskLevel = getRiskLevel(analysis.riskScore);

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

// ─── Sector Risk Assessment ──────────────────────────────

/**
 * Assess sector concentration risk.
 * Returns sectors that exceed the threshold (default 40%).
 */
export function getSectorConcentrationWarnings(
  analysis: PortfolioAnalysis,
  threshold: number = 0.4
): string[] {
  return analysis.sectorDistribution
    .filter((s) => s.allocationPct > threshold)
    .map((s) => s.sector);
}
