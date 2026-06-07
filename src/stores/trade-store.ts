import { create } from "zustand";
import type { FinalRecommendation } from "@/types/agent";
import { executeSwap, getTransactionStatus } from "@/services/trust-wallet";

export interface Trade {
  id: string;
  recommendationId: string;
  tokenSymbol: string;
  tokenName: string;
  action: "BUY" | "HOLD" | "SELL";
  amount: number;
  amountUsd: number;
  txHash: string | null;
  approvalTxHash: string | null;
  status: "PENDING" | "APPROVING" | "APPROVED" | "SUBMITTED" | "CONFIRMED" | "FAILED";
  warning: string | null;
  createdAt: string;
}

interface TradeStore {
  trades: Trade[];
  activeTrade: Trade | null;
  isExecuting: boolean;
  swapPhase: "idle" | "approving" | "swapping" | "confirming";
  error: string | null;

  executeTrade: (
    recommendation: FinalRecommendation,
    walletAddress: string,
    portfolioValueUsd: number,
    slippage?: number
  ) => Promise<void>;
  rejectTrade: (recommendationId: string) => void;
  resetTrade: () => void;
  clearError: () => void;
}

export const useTradeStore = create<TradeStore>((set, get) => ({
  trades: [],
  activeTrade: null,
  isExecuting: false,
  swapPhase: "idle",
  error: null,

  executeTrade: async (
    recommendation: FinalRecommendation,
    walletAddress: string,
    portfolioValueUsd: number,
    slippage?: number
  ) => {
    set({ isExecuting: true, error: null, swapPhase: "swapping" });

    const tradeId = `trade_${Date.now()}`;

    try {
      // Calculate USD amount from allocation percentage
      const allocationValue =
        (recommendation.allocation / 100) * portfolioValueUsd;

      // Clamp slippage to valid range
      const effectiveSlippage = Math.min(50, Math.max(0.1, slippage ?? 0.5));

      // For BUY orders, execute a real swap via Trust Wallet
      let txHash: string | null = null;
      let approvalTxHash: string | null = null;
      let swapWarning: string | null = null;
      let amount = 0;

      if (recommendation.decision === "BUY") {
        // Determine the source token (use USDT if available, otherwise BNB)
        // In production, this should check the user's actual holdings
        const fromToken = "USDT";
        const toToken = recommendation.tokenSymbol;

        // Get the swap amount in the source token
        const swapAmount = allocationValue.toFixed(2);

        // Execute real swap
        const swapResult = await executeSwap({
          fromToken,
          toToken,
          amount: swapAmount,
          slippage: effectiveSlippage,
          walletAddress,
        });

        txHash = swapResult.txHash;
        approvalTxHash = swapResult.approvalTxHash ?? null;
        swapWarning = swapResult.warning ?? null;
        amount = parseFloat(swapResult.toAmount);

        // Update phase if an approval was executed
        if (swapResult.approvalTxHash) {
          set({ swapPhase: "approving" });
        }
      } else if (recommendation.decision === "SELL") {
        // For SELL, swap the token back to USDT
        const fromToken = recommendation.tokenSymbol;
        const toToken = "USDT";

        // Estimate amount to sell based on allocation
        // In production, this should check actual holdings
        const sellAmount = (allocationValue / 100).toFixed(6); // Rough estimate

        set({ swapPhase: "approving" }); // SELL always needs approval

        const swapResult = await executeSwap({
          fromToken,
          toToken,
          amount: sellAmount,
          slippage: effectiveSlippage,
          walletAddress,
        });

        txHash = swapResult.txHash;
        approvalTxHash = swapResult.approvalTxHash ?? null;
        swapWarning = swapResult.warning ?? null;
        amount = parseFloat(swapResult.fromAmount);
      }

      const trade: Trade = {
        id: tradeId,
        recommendationId: tradeId,
        tokenSymbol: recommendation.tokenSymbol,
        tokenName: recommendation.tokenName,
        action: recommendation.decision,
        amount,
        amountUsd: allocationValue,
        txHash,
        approvalTxHash,
        status: "SUBMITTED",
        warning: swapWarning,
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
            txHash: trade.txHash,
          }),
        });
      } catch (apiError) {
        console.error("Failed to persist trade:", apiError);
      }

      set((state) => ({
        trades: [trade, ...state.trades],
        activeTrade: trade,
        isExecuting: false,
        swapPhase: "confirming",
      }));

      // Poll for transaction confirmation
      if (txHash) {
        pollTransactionStatus(tradeId, txHash);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Trade execution failed";
      set({
        isExecuting: false,
        swapPhase: "idle",
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
          approvalTxHash: null,
          status: "FAILED",
          warning: null,
          createdAt: new Date().toISOString(),
        },
      });
    }
  },

  rejectTrade: (_recommendationId: string) => {
    // Trade rejected — no action needed
  },

  resetTrade: () => {
    set({ activeTrade: null, isExecuting: false, error: null, swapPhase: "idle" });
  },

  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Poll for transaction confirmation status.
 */
function pollTransactionStatus(tradeId: string, txHash: string) {
  const maxAttempts = 60; // 5 minutes (5s interval)
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;
    try {
      const status = await getTransactionStatus(txHash);

      if (status === "confirmed") {
        clearInterval(interval);
        useTradeStore.setState((state) => ({
          trades: state.trades.map((t) =>
            t.id === tradeId ? { ...t, status: "CONFIRMED" as const } : t
          ),
          activeTrade:
            state.activeTrade?.id === tradeId
              ? { ...state.activeTrade, status: "CONFIRMED" as const }
              : state.activeTrade,
        }));
      } else if (status === "failed") {
        clearInterval(interval);
        useTradeStore.setState((state) => ({
          trades: state.trades.map((t) =>
            t.id === tradeId ? { ...t, status: "FAILED" as const } : t
          ),
          activeTrade:
            state.activeTrade?.id === tradeId
              ? { ...state.activeTrade, status: "FAILED" as const }
              : state.activeTrade,
        }));
      }
    } catch (error) {
      console.error("Error polling tx status:", error);
    }

    if (attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 5000);
}
