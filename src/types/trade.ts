/**
 * Trade execution types
 */

export type TradeDecision = "BUY" | "HOLD" | "SELL";

export enum RecommendationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  MODIFIED = "MODIFIED",
  EXPIRED = "EXPIRED",
}

export enum TradeStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface Trade {
  id: string;
  recommendationId: string;
  userId: string;
  txHash: string | null;
  tokenSymbol: string;
  action: TradeDecision;
  amount: number;
  amountUsd: number;
  status: TradeStatus;
  executedAt: string | null;
  createdAt: string;
}

export interface CreateTradeRequest {
  recommendationId: string;
  tokenSymbol: string;
  action: TradeDecision;
  amount: number;
  amountUsd: number;
}

export interface UpdateRecommendationRequest {
  status: RecommendationStatus;
  modifiedAllocation?: number;
}
