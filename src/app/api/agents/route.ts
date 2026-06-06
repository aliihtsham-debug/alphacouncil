import { NextRequest, NextResponse } from "next/server";
import { Orchestrator } from "@/services/ai/orchestrator";
import { getMarketOverview } from "@/services/coinmarketcap";
import { prisma } from "@/lib/prisma";
import { AgentType } from "@/types/agent";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, portfolio } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Get userId from middleware header
    const userId = request.headers.get("x-user-id") ?? undefined;

    // Get market data
    const marketOverview = await getMarketOverview();

    const orchestrator = new Orchestrator();
    const result = await orchestrator.runWithEvents(
      {
        prompt,
        portfolio,
        marketData: {
          fearGreedIndex: marketOverview.fearGreedIndex,
          btcDominance: marketOverview.btcDominance,
          trendingTokens: marketOverview.topTokens.map((t) => t.symbol),
        },
      },
      () => {} // No-op for non-streaming
    );

    // Persist to database
    try {
      const recommendation = await prisma.recommendation.create({
        data: {
          userId: userId ?? `temp_${result.sessionId}`,
          prompt,
          decision: result.recommendation.decision,
          tokenSymbol: result.recommendation.tokenSymbol,
          tokenName: result.recommendation.tokenName,
          allocationPct: result.recommendation.allocation,
          confidence: result.recommendation.confidence,
          investmentThesis: result.recommendation.investmentThesis,
          status: "PENDING",
        },
      });

      const agentResults = result.agentResults;
      const agentTypeMap: Array<{
        type: AgentType;
        result: {
          success: boolean;
          data?: unknown;
          error?: string;
          latencyMs: number;
        };
      }> = [
        {
          type: AgentType.MARKET_RESEARCH,
          result: agentResults.marketResearch,
        },
        {
          type: AgentType.BULL_ANALYST,
          result: agentResults.bullAnalyst,
        },
        {
          type: AgentType.BEAR_ANALYST,
          result: agentResults.bearAnalyst,
        },
        { type: AgentType.RISK_MANAGER, result: agentResults.riskManager },
        {
          type: AgentType.PORTFOLIO_MANAGER,
          result: agentResults.portfolioManager,
        },
      ];

      for (const { type, result: r } of agentTypeMap) {
        if (r.success && r.data) {
          await prisma.agentDebate.create({
            data: {
              recommendationId: recommendation.id,
              agentType: type,
              content: JSON.stringify(r.data),
              structuredOutput: r.data as unknown as object,
              confidence: (
                r.data as { confidence?: number } | undefined
              )?.confidence,
              latencyMs: r.latencyMs,
            },
          });
        }
      }

      await prisma.auditLog.create({
        data: {
          userId: userId ?? `temp_${result.sessionId}`,
          action: "DEBATE_INIT",
          metadata: {
            sessionId: result.sessionId,
            recommendationId: recommendation.id,
            tokenSymbol: result.recommendation.tokenSymbol,
            decision: result.recommendation.decision,
          },
        },
      });
    } catch (dbError) {
      console.error("Failed to persist debate:", dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: result.sessionId,
        recommendation: result.recommendation,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Debate failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
