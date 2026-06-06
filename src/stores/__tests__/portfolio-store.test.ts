import { describe, it, expect, beforeEach } from "vitest";
import { usePortfolioStore } from "../portfolio-store";

describe("portfolio-store", () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      data: null,
      isLoading: false,
      error: null,
      analyzedAt: null,
    });
  });

  it("starts with no portfolio", () => {
    const state = usePortfolioStore.getState();
    expect(state.data).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it("sets portfolio data", () => {
    const mockPortfolio = {
      totalValueUsd: 10000,
      stablecoinRatio: 0.2,
      riskScore: 45,
      concentrationRisk: 0.3,
      assets: [],
      sectorDistribution: [],
      analyzedAt: new Date().toISOString(),
    };
    usePortfolioStore.getState().setPortfolio(mockPortfolio);
    expect(usePortfolioStore.getState().data).toEqual(mockPortfolio);
    expect(usePortfolioStore.getState().analyzedAt).not.toBeNull();
  });

  it("sets loading state", () => {
    usePortfolioStore.getState().setLoading(true);
    expect(usePortfolioStore.getState().isLoading).toBe(true);
  });

  it("sets error", () => {
    usePortfolioStore.getState().setError("Test error");
    expect(usePortfolioStore.getState().error).toBe("Test error");
  });

  it("clears data on refresh", () => {
    usePortfolioStore.setState({
      data: { totalValueUsd: 100 } as never,
      analyzedAt: "2024-01-01",
    });
    usePortfolioStore.getState().refresh();
    expect(usePortfolioStore.getState().data).toBeNull();
    expect(usePortfolioStore.getState().analyzedAt).toBeNull();
  });
});
