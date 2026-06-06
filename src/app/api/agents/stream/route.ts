/**
 * SSE Streaming endpoint for real-time agent debate.
 */

import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Orchestrator } from "@/services/ai/orchestrator";
import { getMarketOverview } from "@/services/coinmarketcap";
import { prisma } from "@/lib/prisma";
import { AgentType } from "@/types/agent";

export const maxDuration = 120;

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, portfolio } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userId = request.headers.get("x-user-id") ?? undefined;
    const marketOverview = await getMarketOverview();
    const orchestrator = new Orchestrator();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: Record<string, unknown>) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        };

        let orchestratorOutput;
        try {
          orchestratorOutput = await orchestrator.runWithEvents(
            {
              prompt,
              portfolio,
              marketData: {
                fearGreedIndex: marketOverview.fearGreedIndex,
                btcDominance: marketOverview.btcDominance,
                trendingTokens: marketOverview.topTokens.map((t) => t.symbol),
              },
            },
            (event) => sendEvent(event as Record<string, unknown>)
          );

          if (orchestratorOutput) {
            persistDebate(userId, prompt, orchestratorOutput).catch(() => {});
          }
        } catch (error) {
          sendEvent({
            type: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        ...corsHeaders,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stream failed";
    Sentry.captureException(error);
    return new Response(
      `data: ${JSON.stringify({ type: "error", message })}\n\n`,
      {
        status: 200,
        headers: { "Content-Type": "text/event-stream", ...corsHeaders },
      }
    );
  }
}

async function persistDebate(
  userId: string | undefined,
  prompt: string,
  output: Awaited<ReturnType<Orchestrator["runWithEvents"]>>
) {
  try {
    const recommendation = await prisma.recommendation.create({
      data: {
        userId: userId ?? `temp_${output.sessionId}`,
        prompt,
        decision: output.recommendation.decision,
        tokenSymbol: output.recommendation.tokenSymbol,
        tokenName: output.recommendation.tokenName,
        allocationPct: output.recommendation.allocation,
        confidence: output.recommendation.confidence,
        investmentThesis: output.recommendation.investmentThesis,
        status: "PENDING",
      },
    });

    const agentResults = output.agentResults;
    const agentTypeMap: Array<{
      type: AgentType;
      result: {
        success: boolean;
        data?: unknown;
        error?: string;
        latencyMs: number;
      };
    }> = [
      { type: AgentType.MARKET_RESEARCH, result: agentResults.marketResearch },
      { type: AgentType.BULL_ANALYST, result: agentResults.bullAnalyst },
      { type: AgentType.BEAR_ANALYST, result: agentResults.bearAnalyst },
      { type: AgentType.RISK_MANAGER, result: agentResults.riskManager },
      {
        type: AgentType.PORTFOLIO_MANAGER,
        result: agentResults.portfolioManager,
      },
    ];

    for (const { type, result } of agentTypeMap) {
      if (result.success && result.data) {
        await prisma.agentDebate.create({
          data: {
            recommendationId: recommendation.id,
            agentType: type,
            content: JSON.stringify(result.data),
            structuredOutput: JSON.parse(JSON.stringify(result.data)),
            confidence: (
              result.data as { confidence?: number } | undefined
            )?.confidence,
            latencyMs: result.latencyMs,
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: userId ?? `temp_${output.sessionId}`,
        action: "DEBATE_INIT",
        metadata: {
          sessionId: output.sessionId,
          recommendationId: recommendation.id,
          tokenSymbol: output.recommendation.tokenSymbol,
          decision: output.recommendation.decision,
        },
      },
    });
  } catch (error) {
    console.error("Failed to persist debate:", error);
    Sentry.captureException(error);
  }
}
