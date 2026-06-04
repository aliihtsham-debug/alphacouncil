/**
 * SSE Streaming endpoint for real-time agent debate.
 *
 * Returns a ReadableStream that streams events as they happen.
 * Client connects via fetch + ReadableStream (use-debate hook).
 */

import { NextRequest } from "next/server";
import { Orchestrator } from "@/services/ai/orchestrator";
import { getMarketOverview } from "@/services/coinmarketcap";

export const maxDuration = 120;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get market data
    const marketOverview = await getMarketOverview();

    const orchestrator = new Orchestrator();

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: Record<string, unknown>) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        };

        try {
          await orchestrator.runWithEvents(
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
    console.error("SSE stream error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Stream failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}
