/**
 * GET /api/trades/:id — Return single trade with tx status
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Mock data store (replaced by Prisma later) ──────────

const mockTrades = new Map<string, {
  id: string;
  recommendationId: string;
  tokenSymbol: string;
  tokenName: string;
  action: string;
  amount: number;
  amountUsd: number;
  txHash: string | null;
  status: string;
  createdAt: string;
}>();

// ─── GET ─────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trade = mockTrades.get(id);

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
}
