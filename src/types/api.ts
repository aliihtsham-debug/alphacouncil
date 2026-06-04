/**
 * API request/response types
 */

import type { FinalRecommendation } from "./agent";
import type { PortfolioAnalysis } from "./portfolio";
import type { TokenMetadata, TrendingToken, CategoryInfo } from "./market";
import type { Trade, CreateTradeRequest, UpdateRecommendationRequest } from "./trade";

// ─── Common ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ─── Market ─────────────────────────────────────────────

export interface MarketOverviewResponse {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  fearGreedIndex: number;
  fearGreedClassification: string;
  topTokens: TokenMetadata[];
}

export type TrendingResponse = ApiResponse<TrendingToken[]>;
export type TokensResponse = ApiResponse<TokenMetadata[]>;
export type CategoriesResponse = ApiResponse<CategoryInfo[]>;

// ─── Portfolio ──────────────────────────────────────────

export type PortfolioResponse = ApiResponse<PortfolioAnalysis>;

// ─── Agents ─────────────────────────────────────────────

export interface DebateRequest {
  prompt: string;
  portfolio?: PortfolioAnalysis;
}

export type DebateResponse = ApiResponse<{ sessionId: string }>;

// ─── Recommendation ─────────────────────────────────────

export type RecommendationResponse = ApiResponse<FinalRecommendation>;
export type RecommendationsListResponse = ApiResponse<FinalRecommendation[]>;

export interface UpdateRecommendationBody {
  action: "approve" | "reject" | "modify";
  modifiedAllocation?: number;
}

// ─── Trades ─────────────────────────────────────────────

export type TradesResponse = ApiResponse<Trade[]>;
export type TradeResponse = ApiResponse<Trade>;
export type CreateTradeBody = CreateTradeRequest;
export type UpdateTradeBody = UpdateRecommendationRequest;

// ─── Reports ────────────────────────────────────────────

export interface GenerateReportRequest {
  type: "INVESTMENT" | "WEEKLY_REBALANCE" | "PORTFOLIO_HEALTH";
  format: "PDF" | "MARKDOWN";
  recommendationId?: string;
}

export interface GenerateReportResponse {
  id: string;
  content: string;
  format: "PDF" | "MARKDOWN";
  downloadUrl?: string;
}
