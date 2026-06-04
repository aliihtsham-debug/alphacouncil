import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // In production: fetch from database
    return NextResponse.json({
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Trades fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trades",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recommendationId, tokenSymbol, action, amount, amountUsd } = body;

    // In production: execute via Trust Wallet SDK
    const mockTxHash = "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    return NextResponse.json({
      success: true,
      data: {
        id: `trade_${Date.now()}`,
        recommendationId,
        tokenSymbol,
        action,
        amount,
        amountUsd,
        txHash: mockTxHash,
        status: "SUBMITTED",
        createdAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Trade create error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute trade",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
