import { NextRequest, NextResponse } from "next/server";
import { Orchestrator } from "@/services/ai/orchestrator";
import { getMarketOverview } from "@/services/coinmarketcap";

export const maxDuration = 120; // 2 min max for Vercel

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
