import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const revalidate = 0; // No cache for recommendations

const createSchema = z.object({
  sessionId: z.string().optional(),
  decision: z.enum(["BUY", "HOLD", "SELL"]),
  tokenSymbol: z.string().min(1),
  tokenName: z.string().min(1),
  allocation: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  investmentThesis: z.string().min(1),
  supportingArguments: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  userId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    const data = await prisma.recommendation.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        agentDebates: {
          orderBy: { createdAt: "asc" },
        },
        executedTrade: true,
      },
    });

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recommendations fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recommendations",
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

    const {
      decision,
      tokenSymbol,
      tokenName,
      allocation,
      confidence,
      investmentThesis,
      supportingArguments,
      risks,
      userId,
    } = parsed.data;

    // Ensure user exists
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const anonUser = await prisma.user.create({
        data: {
          walletAddress: `anon_${Date.now()}`,
        },
      });
      effectiveUserId = anonUser.id;
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        userId: effectiveUserId,
        prompt: `${decision} ${tokenSymbol}`,
        decision,
        tokenSymbol,
        tokenName,
        allocationPct: allocation,
        confidence,
        investmentThesis,
        status: "PENDING",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: effectiveUserId,
        action: "RECOMMENDATION_CREATED",
        metadata: {
          recommendationId: recommendation.id,
          tokenSymbol,
          decision,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: recommendation.id,
        decision,
        tokenSymbol,
        tokenName,
        allocation,
        confidence,
        investmentThesis,
        supportingArguments,
        risks,
        status: "PENDING",
        createdAt: recommendation.createdAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recommendation create error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create recommendation",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
