/**
 * AI Agent shared types
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
  baseUrl?: string;
}

export interface AgentInput {
  prompt: string;
  context: Record<string, unknown>;
  predecessorOutputs?: Record<string, unknown>;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  latencyMs: number;
  tokensUsed?: number;
}

export interface DebateContext {
  userPrompt: string;
  portfolio?: {
    totalValueUsd: number;
    assets: Array<{
      tokenSymbol: string;
      tokenName: string;
      allocationPct: number;
      sector: string;
    }>;
    riskScore: number;
    stablecoinRatio: number;
  };
  marketData?: {
    fearGreedIndex: number;
    btcDominance: number;
    trendingTokens: string[];
  };
}
