import { create } from "zustand";
import type { FinalRecommendation } from "@/types/agent";

export interface Trade {
  id: string;
  recommendationId: string;
  tokenSymbol: string;
  tokenName: string;
  action: "BUY" | "HOLD" | "SELL";
  amount: number;
  amountUsd: number;
  txHash: string | null;
  status: "PENDING" | "SUBMITTED" | "CONFIRMED" | "FAILED";
  createdAt: string;
}

interface TradeStore {
  trades: Trade[];
  activeTrade: Trade | null;
  isExecuting: boolean;
  error: string | null;

  executeTrade: (recommendation: FinalRecommendation) => Promise<void>;
  rejectTrade: (recommendationId: string) => void;
  resetTrade: () => void;
  clearError: () => void;
}

export const useTradeStore = create<TradeStore>((set, get) => ({
  trades: [],
  activeTrade: null,
  isExecuting: false,
  error: null,

  executeTrade: async (recommendation: FinalRecommendation) => {
    set({ isExecuting: true, error: null });

    const tradeId = `trade_${Date.now()}`;

    try {
      // Calculate amount based on allocation and a mock portfolio value
      // In production, this would come from the actual portfolio
      const portfolioValue = 12847.53;
      const allocationValue = (recommendation.allocation / 100) * portfolioValue;

      // Get mock price for the token
      const mockPrices: Record<string, number> = {
        FET: 1.5,
        BNB: 283.66,
        ETH: 3243.0,
        SOL: 178.5,
        LINK: 13.33,
        UNI: 12.45,
        DOT: 7.85,
        PEPE: 0.00001234,
        XRP: 2.34,
      };

      const price = mockPrices[recommendation.tokenSymbol] ?? 1;
      const amount = allocationValue / price;

      // Simulate swap execution (in production, call executeSwap from trust-wallet)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock tx hash
      const txHash =
        "0x" +
        Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");

      const trade: Trade = {
        id: tradeId,
        recommendationId: tradeId,
        tokenSymbol: recommendation.tokenSymbol,
        tokenName: recommendation.tokenName,
        action: recommendation.decision,
        amount,
        amountUsd: allocationValue,
        txHash,
        status: "SUBMITTED",
        createdAt: new Date().toISOString(),
      };

      // Persist to API
      try {
        await fetch("/api/trades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recommendationId: trade.recommendationId,
            tokenSymbol: trade.tokenSymbol,
            action: trade.action,
            amount: trade.amount,
            amountUsd: trade.amountUsd,
          }),
        });
      } catch (apiError) {
        console.error("Failed to persist trade:", apiError);
      }

      set((state) => ({
        trades: [trade, ...state.trades],
        activeTrade: trade,
        isExecuting: false,
      }));

      // Simulate confirmation after a delay
      setTimeout(() => {
        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === tradeId ? { ...t, status: "CONFIRMED" as const } : t
          ),
          activeTrade:
            state.activeTrade?.id === tradeId
              ? { ...state.activeTrade, status: "CONFIRMED" as const }
              : state.activeTrade,
        }));
      }, 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Trade execution failed";
      set({
        isExecuting: false,
        error: message,
        activeTrade: {
          id: tradeId,
          recommendationId: tradeId,
          tokenSymbol: recommendation.tokenSymbol,
          tokenName: recommendation.tokenName,
          action: recommendation.decision,
          amount: 0,
          amountUsd: 0,
          txHash: null,
          status: "FAILED",
          createdAt: new Date().toISOString(),
        },
      });
    }
  },

  rejectTrade: (recommendationId: string) => {
    // In production: POST to /api/recommendation with rejected status
    console.log("Trade rejected:", recommendationId);
  },

  resetTrade: () => {
    set({ activeTrade: null, isExecuting: false, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
