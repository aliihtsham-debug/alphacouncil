/**
 * GET /api/trades/:id — Return single trade with tx status
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const trade = await prisma.executedTrade.findUnique({
      where: { id },
      include: {
        recommendation: {
          select: {
            id: true,
            tokenSymbol: true,
            tokenName: true,
            decision: true,
            confidence: true,
            investmentThesis: true,
          },
        },
      },
    });

    if (!trade) {
      return NextResponse.json(
        { success: false, error: "Trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trade,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Trade fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trade",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
