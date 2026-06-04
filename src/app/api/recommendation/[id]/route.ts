/**
 * GET /api/recommendation/:id — Return single recommendation
 * PUT /api/recommendation/:id — Update status (APPROVED/REJECTED/MODIFIED)
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Mock data store (replaced by Prisma later) ──────────

const mockRecommendations = new Map<string, {
  id: string;
  prompt: string;
  decision: string;
  tokenSymbol: string;
  tokenName: string;
  allocation: number;
  confidence: number;
  investmentThesis: string;
  status: string;
  createdAt: string;
  agentDebates: Array<{
    agentType: string;
    content: string;
    confidence?: number;
    latencyMs?: number;
  }>;
}>();

// Seed with sample data
mockRecommendations.set("rec_sample_1", {
  id: "rec_sample_1",
  prompt: "Find the best AI token opportunity",
  decision: "BUY",
  tokenSymbol: "FET",
  tokenName: "Fetch.ai",
  allocation: 8,
  confidence: 87,
  investmentThesis: "Fetch.ai demonstrates strong momentum in the AI narrative.",
  status: "PENDING",
  createdAt: new Date().toISOString(),
  agentDebates: [],
});

// ─── GET ─────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rec = mockRecommendations.get(id);

  if (!rec) {
    return NextResponse.json(
      { success: false, error: "Recommendation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: rec,
    timestamp: new Date().toISOString(),
  });
}

// ─── PUT ─────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rec = mockRecommendations.get(id);

  if (!rec) {
    return NextResponse.json(
      { success: false, error: "Recommendation not found" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "MODIFIED", "EXPIRED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    rec.status = status;
    mockRecommendations.set(id, rec);

    return NextResponse.json({
      success: true,
      data: rec,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
