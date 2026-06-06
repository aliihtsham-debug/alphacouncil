import { describe, it, expect } from "vitest";
import { generateReport } from "../generator";

describe("generateReport", () => {
  it("generates INVESTMENT report", () => {
    const result = generateReport({
      type: "INVESTMENT",
      format: "MARKDOWN",
    });
    expect(result.type).toBe("INVESTMENT");
    expect(result.content).toContain("Alpha Council Investment Report");
    expect(result.content).toContain("Investment Analysis");
  });

  it("generates WEEKLY_REBALANCE report", () => {
    const result = generateReport({
      type: "WEEKLY_REBALANCE",
      format: "MARKDOWN",
    });
    expect(result.type).toBe("WEEKLY_REBALANCE");
    expect(result.content).toContain("Weekly Rebalance");
  });

  it("generates PORTFOLIO_HEALTH report", () => {
    const result = generateReport({
      type: "PORTFOLIO_HEALTH",
      format: "MARKDOWN",
    });
    expect(result.type).toBe("PORTFOLIO_HEALTH");
    expect(result.content).toContain("Portfolio Health Check");
  });

  it("includes portfolio data when provided", () => {
    const result = generateReport({
      type: "INVESTMENT",
      format: "MARKDOWN",
      portfolioData: {
        totalValueUsd: 15000,
        riskScore: 45,
        assets: [
          {
            tokenSymbol: "BNB",
            allocationPct: 0.6,
            valueUsd: 9000,
            sector: "Layer1",
          },
        ],
      },
    });
    expect(result.content).toContain("$15,000");
    expect(result.content).toContain("45/100");
    expect(result.content).toContain("BNB");
  });

  it("includes recommendation data when provided", () => {
    const result = generateReport({
      type: "INVESTMENT",
      format: "MARKDOWN",
      recommendationData: {
        decision: "BUY",
        tokenSymbol: "FET",
        tokenName: "Fetch.ai",
        allocation: 5,
        confidence: 72,
        investmentThesis: "Strong AI narrative and growing ecosystem",
      },
    });
    expect(result.content).toContain("BUY");
    expect(result.content).toContain("FET");
    expect(result.content).toContain("Fetch.ai");
    expect(result.content).toContain("Strong AI narrative");
  });

  it("includes disclaimer footer", () => {
    const result = generateReport({
      type: "INVESTMENT",
      format: "MARKDOWN",
    });
    expect(result.content).toContain("Past performance does not guarantee");
  });

  it("generates unique IDs", () => {
    const result1 = generateReport({ type: "INVESTMENT", format: "MARKDOWN" });
    const result2 = generateReport({ type: "INVESTMENT", format: "MARKDOWN" });
    expect(result1.id).not.toBe(result2.id);
  });
});
