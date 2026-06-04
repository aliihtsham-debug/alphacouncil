/**
 * AI Agent Orchestrator
 *
 * Manages the multi-agent debate pipeline:
 * 1. Market Research → 2. [Bull ∥ Bear] → 3. Risk Manager → 4. Portfolio Manager
 *
 * Supports SSE streaming for real-time updates.
 */

import { MarketResearchAgent } from "./agents/market-research";
import { BullAnalystAgent } from "./agents/bull-analyst";
import { BearAnalystAgent } from "./agents/bear-analyst";
import { RiskManagerAgent } from "./agents/risk-manager";
import { PortfolioManagerAgent } from "./agents/portfolio-manager";
import type { AgentResult } from "./types";
import type { MarketResearchAgentOutput } from "./agents/market-research";
import type { BullAnalystAgentOutput } from "./agents/bull-analyst";
import type { BearAnalystAgentOutput } from "./agents/bear-analyst";
import type { RiskManagerAgentOutput } from "./agents/risk-manager";
import type { PortfolioManagerAgentOutput } from "./agents/portfolio-manager";
import type { FinalRecommendation } from "@/types/agent";
import type { PortfolioAnalysis } from "@/types/portfolio";
import { AgentType } from "@/types/agent";

// ─── Orchestrator Input ──────────────────────────────────

export interface OrchestratorInput {
  prompt: string;
  portfolio?: PortfolioAnalysis;
  marketData: {
    fearGreedIndex: number;
    btcDominance: number;
    trendingTokens: string[];
  };
}

// ─── Orchestrator Output ─────────────────────────────────

export interface OrchestratorOutput {
  sessionId: string;
  recommendation: FinalRecommendation;
  agentResults: {
    marketResearch: AgentResult<MarketResearchAgentOutput>;
    bullAnalyst: AgentResult<BullAnalystAgentOutput>;
    bearAnalyst: AgentResult<BearAnalystAgentOutput>;
    riskManager: AgentResult<RiskManagerAgentOutput>;
    portfolioManager: AgentResult<PortfolioManagerAgentOutput>;
  };
}

// ─── SSE Event Emitter ───────────────────────────────────

export type OrchestratorEvent =
  | { type: "session_start"; sessionId: string }
  | { type: "agent_start"; agent: AgentType }
  | { type: "agent_end"; agent: AgentType; output: unknown; latencyMs: number }
  | { type: "agent_error"; agent: AgentType; error: string }
  | { type: "final"; recommendation: FinalRecommendation }
  | { type: "done" }
  | { type: "error"; message: string };

export type EventHandler = (event: OrchestratorEvent) => void;

// ─── Orchestrator Class ──────────────────────────────────

export class Orchestrator {
  private marketResearchAgent = new MarketResearchAgent();
  private bullAnalystAgent = new BullAnalystAgent();
  private bearAnalystAgent = new BearAnalystAgent();
  private riskManagerAgent = new RiskManagerAgent();
  private portfolioManagerAgent = new PortfolioManagerAgent();

  /**
   * Run the full debate pipeline with SSE event streaming.
   */
  async runWithEvents(
    input: OrchestratorInput,
    onEvent: EventHandler
  ): Promise<OrchestratorOutput> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    onEvent({ type: "session_start", sessionId });

    try {
      // ─── Step 1: Market Research ───────────────────────
      onEvent({ type: "agent_start", agent: AgentType.MARKET_RESEARCH });

      const marketResult = await this.marketResearchAgent.execute({
        userPrompt: input.prompt,
        marketData: input.marketData,
      });

      if (!marketResult.success || !marketResult.data) {
        onEvent({
          type: "agent_error",
          agent: AgentType.MARKET_RESEARCH,
          error: marketResult.error ?? "Market research failed",
        });
        throw new Error(marketResult.error ?? "Market research failed");
      }

      onEvent({
        type: "agent_end",
        agent: AgentType.MARKET_RESEARCH,
        output: marketResult.data,
        latencyMs: marketResult.latencyMs,
      });

      // Pick top candidate
      const topCandidate = marketResult.data.candidateTokens[0];
      if (!topCandidate) {
        throw new Error("No candidate tokens found");
      }

      // ─── Step 2: Bull + Bear (parallel) ────────────────
      onEvent({ type: "agent_start", agent: AgentType.BULL_ANALYST });
      onEvent({ type: "agent_start", agent: AgentType.BEAR_ANALYST });

      const [bullResult, bearResult] = await Promise.all([
        this.bullAnalystAgent.execute({
          candidateToken: topCandidate,
          marketSummary: marketResult.data.marketSummary,
        }),
        this.bearAnalystAgent.execute({
          candidateToken: topCandidate,
          bullArguments: [], // Will be filled if bull completes first
          marketSummary: marketResult.data.marketSummary,
        }),
      ]);

      if (bullResult.success && bullResult.data) {
        onEvent({
          type: "agent_end",
          agent: AgentType.BULL_ANALYST,
          output: bullResult.data,
          latencyMs: bullResult.latencyMs,
        });
      } else {
        onEvent({
          type: "agent_error",
          agent: AgentType.BULL_ANALYST,
          error: bullResult.error ?? "Bull analysis failed",
        });
      }

      if (bearResult.success && bearResult.data) {
        onEvent({
          type: "agent_end",
          agent: AgentType.BEAR_ANALYST,
          output: bearResult.data,
          latencyMs: bearResult.latencyMs,
        });
      } else {
        onEvent({
          type: "agent_error",
          agent: AgentType.BEAR_ANALYST,
          error: bearResult.error ?? "Bear analysis failed",
        });
      }

      // Use defaults if agents failed
      const bullOutput: BullAnalystAgentOutput = bullResult.data ?? {
        bullishArguments: ["Market research identified this as a top candidate"],
        opportunityScore: topCandidate.score,
        confidence: 50,
      };

      const bearOutput: BearAnalystAgentOutput = bearResult.data ?? {
        bearishArguments: ["General market volatility risk"],
        riskScore: 50,
      };

      // ─── Step 3: Risk Manager ──────────────────────────
      onEvent({ type: "agent_start", agent: AgentType.RISK_MANAGER });

      const riskResult = await this.riskManagerAgent.execute({
        currentPortfolio: input.portfolio
          ? {
              totalValueUsd: input.portfolio.totalValueUsd,
              assets: input.portfolio.assets.map((a) => ({
                tokenSymbol: a.tokenSymbol,
                allocationPct: a.allocationPct,
                sector: a.sector ?? "Other",
              })),
              riskScore: input.portfolio.riskScore,
              stablecoinRatio: input.portfolio.stablecoinRatio,
            }
          : {
              totalValueUsd: 0,
              assets: [],
              riskScore: 50,
              stablecoinRatio: 0,
            },
        proposedToken: {
          symbol: topCandidate.symbol,
          name: topCandidate.name,
        },
        bullArguments: bullOutput.bullishArguments,
        bearArguments: bearOutput.bearishArguments,
        marketSummary: marketResult.data.marketSummary,
      });

      if (riskResult.success && riskResult.data) {
        onEvent({
          type: "agent_end",
          agent: AgentType.RISK_MANAGER,
          output: riskResult.data,
          latencyMs: riskResult.latencyMs,
        });
      } else {
        onEvent({
          type: "agent_error",
          agent: AgentType.RISK_MANAGER,
          error: riskResult.error ?? "Risk analysis failed",
        });
      }

      const riskOutput: RiskManagerAgentOutput = riskResult.data ?? {
        allocation: 5,
        portfolioImpact: "Moderate impact on portfolio diversification",
        riskLevel: "medium",
      };

      // ─── Step 4: Portfolio Manager ─────────────────────
      onEvent({ type: "agent_start", agent: AgentType.PORTFOLIO_MANAGER });

      const portfolioResult = await this.portfolioManagerAgent.execute({
        userPrompt: input.prompt,
        marketResearch: {
          candidateTokens: marketResult.data.candidateTokens,
          marketSummary: marketResult.data.marketSummary,
        },
        bullAnalysis: bullOutput,
        bearAnalysis: bearOutput,
        riskManagement: riskOutput,
      });

      if (portfolioResult.success && portfolioResult.data) {
        onEvent({
          type: "agent_end",
          agent: AgentType.PORTFOLIO_MANAGER,
          output: portfolioResult.data,
          latencyMs: portfolioResult.latencyMs,
        });
      } else {
        onEvent({
          type: "agent_error",
          agent: AgentType.PORTFOLIO_MANAGER,
          error: portfolioResult.error ?? "Portfolio decision failed",
        });
        throw new Error(portfolioResult.error ?? "Portfolio decision failed");
      }

      const portfolioOutput = portfolioResult.data;

      // ─── Build Final Recommendation ────────────────────
      const recommendation: FinalRecommendation = {
        decision: portfolioOutput.decision,
        tokenSymbol: topCandidate.symbol,
        tokenName: topCandidate.name,
        allocation: Math.min(portfolioOutput.allocation, riskOutput.allocation),
        confidence: portfolioOutput.confidence,
        investmentThesis: portfolioOutput.thesis,
        supportingArguments: bullOutput.bullishArguments,
        risks: bearOutput.bearishArguments,
      };

      onEvent({ type: "final", recommendation });
      onEvent({ type: "done" });

      return {
        sessionId,
        recommendation,
        agentResults: {
          marketResearch: marketResult,
          bullAnalyst: bullResult,
          bearAnalyst: bearResult,
          riskManager: riskResult,
          portfolioManager: portfolioResult,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      onEvent({ type: "error", message });
      throw error;
    }
  }

  /**
   * Run the full pipeline without streaming (for non-SSE use).
   */
  async run(input: OrchestratorInput): Promise<OrchestratorOutput> {
    return this.runWithEvents(input, () => {});
  }
}
