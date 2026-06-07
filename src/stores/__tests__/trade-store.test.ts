import { describe, it, expect, beforeEach } from "vitest";
import { useTradeStore } from "../trade-store";

describe("trade-store", () => {
  beforeEach(() => {
    useTradeStore.setState({
      trades: [],
      activeTrade: null,
      isExecuting: false,
      error: null,
    });
  });

  it("starts with empty trades", () => {
    const state = useTradeStore.getState();
    expect(state.trades).toEqual([]);
    expect(state.activeTrade).toBeNull();
    expect(state.isExecuting).toBe(false);
  });

  it("rejects a trade without error", () => {
    expect(() => {
      useTradeStore.getState().rejectTrade("rec_123");
    }).not.toThrow();
  });

  it("resets trade state", () => {
    useTradeStore.setState({
      activeTrade: {
        id: "test",
        recommendationId: "rec_1",
        tokenSymbol: "FET",
        tokenName: "Fetch.ai",
        action: "BUY",
        amount: 100,
        amountUsd: 200,
        txHash: null,
        approvalTxHash: null,
        status: "FAILED",
        warning: null,
        createdAt: new Date().toISOString(),
      },
      error: "Some error",
    });

    useTradeStore.getState().resetTrade();
    const state = useTradeStore.getState();
    expect(state.activeTrade).toBeNull();
    expect(state.error).toBeNull();
  });

  it("clears error", () => {
    useTradeStore.setState({ error: "Test error" });
    useTradeStore.getState().clearError();
    expect(useTradeStore.getState().error).toBeNull();
  });
});
