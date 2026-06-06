import { describe, it, expect } from "vitest";
import { analyzePortfolio } from "../analyzer";
import type { WalletPortfolio } from "@/services/trust-wallet";

describe("analyzePortfolio", () => {
  const basePortfolio: WalletPortfolio = {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    chain: "BNB",
    totalBalanceUsd: 10000,
    tokens: [
      {
        contractAddress: null,
        symbol: "BNB",
        name: "BNB",
        decimals: 18,
        balance: "20",
        balanceUsd: 6000,
        priceUsd: 300,
        percentChange24h: 2.5,
      },
      {
        contractAddress: "0x55d398326f99059fF775485246999027B3197955",
        symbol: "USDT",
        name: "Tether USD",
        decimals: 18,
        balance: "2000",
        balanceUsd: 2000,
        priceUsd: 1,
        percentChange24h: 0.01,
      },
      {
        contractAddress: "0x031b41e504677879370e9DBcF937283A8691Fa7f",
        symbol: "FET",
        name: "Fetch.ai",
        decimals: 18,
        balance: "1000",
        balanceUsd: 2000,
        priceUsd: 2,
        percentChange24h: 5.0,
      },
    ],
    lastUpdated: new Date().toISOString(),
  };

  it("returns correct total value", () => {
    const result = analyzePortfolio(basePortfolio);
    expect(result.totalValueUsd).toBe(10000);
  });

  it("calculates allocation percentages correctly", () => {
    const result = analyzePortfolio(basePortfolio);
    const bnb = result.assets.find((a) => a.tokenSymbol === "BNB");
    expect(bnb?.allocationPct).toBeCloseTo(0.6, 2);
  });

  it("identifies stablecoin ratio", () => {
    const result = analyzePortfolio(basePortfolio);
    expect(result.stablecoinRatio).toBeCloseTo(0.2, 2);
  });

  it("returns assets array with correct length", () => {
    const result = analyzePortfolio(basePortfolio);
    expect(result.assets.length).toBe(3);
  });

  it("classifies sectors correctly", () => {
    const result = analyzePortfolio(basePortfolio);
    const bnb = result.assets.find((a) => a.tokenSymbol === "BNB");
    expect(bnb?.sector).toBe("Layer1");
    const usdt = result.assets.find((a) => a.tokenSymbol === "USDT");
    expect(usdt?.sector).toBe("Stablecoin");
  });

  it("handles empty portfolio", () => {
    const emptyPortfolio: WalletPortfolio = {
      ...basePortfolio,
      totalBalanceUsd: 0,
      tokens: [],
    };
    const result = analyzePortfolio(emptyPortfolio);
    expect(result.totalValueUsd).toBe(0);
    expect(result.assets.length).toBe(0);
    // Empty portfolio still gets a base risk score from the formula
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it("calculates risk score within 0-100 range", () => {
    const result = analyzePortfolio(basePortfolio);
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it("includes price change data", () => {
    const result = analyzePortfolio(basePortfolio);
    const bnb = result.assets.find((a) => a.tokenSymbol === "BNB");
    expect(bnb?.priceChange24h).toBe(2.5);
  });
});
