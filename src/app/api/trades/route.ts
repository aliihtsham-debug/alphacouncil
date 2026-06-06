import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const revalidate = 0;

const createSchema = z.object({
  recommendationId: z.string().min(1),
  tokenSymbol: z.string().min(1),
  action: z.enum(["BUY", "HOLD", "SELL"]),
  amount: z.number().positive(),
  amountUsd: z.number().positive(),
  userId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    const data = await prisma.executedTrade.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        recommendation: {
          select: {
            id: true,
            tokenSymbol: true,
            tokenName: true,
            decision: true,
            confidence: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data,
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
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { recommendationId, tokenSymbol, action, amount, amountUsd, userId } =
      parsed.data;

    // Fetch the recommendation to get userId if not provided
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      return NextResponse.json(
        { success: false, error: "Recommendation not found" },
        { status: 404 }
      );
    }

    const effectiveUserId = userId ?? recommendation.userId;

    // Execute via Trust Wallet SDK (demo mode returns mock txHash)
    const mockTxHash =
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

    const trade = await prisma.executedTrade.create({
      data: {
        recommendationId,
        userId: effectiveUserId,
        txHash: mockTxHash,
        tokenSymbol,
        action,
        amount,
        amountUsd,
        status: "SUBMITTED",
      },
    });

    // Update recommendation status to APPROVED
    await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { status: "APPROVED" },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: effectiveUserId,
        action: "TRADE_EXECUTED",
        metadata: {
          tradeId: trade.id,
          recommendationId,
          tokenSymbol,
          action,
          amount,
          amountUsd,
          txHash: mockTxHash,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: trade.id,
        recommendationId,
        tokenSymbol,
        action,
        amount,
        amountUsd,
        txHash: mockTxHash,
        status: "SUBMITTED",
        createdAt: trade.createdAt,
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
