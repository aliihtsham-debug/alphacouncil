import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReport } from "@/services/reports/generator";
import { z } from "zod";

export const revalidate = 0;

const createSchema = z.object({
  type: z.enum(["INVESTMENT", "WEEKLY_REBALANCE", "PORTFOLIO_HEALTH"]),
  format: z.enum(["PDF", "MARKDOWN"]).default("MARKDOWN"),
  recommendationId: z.string().optional(),
  userId: z.string().optional(),
});

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

    const { type, format, recommendationId, userId } = parsed.data;

    // Fetch recommendation data if provided
    let recommendationData;
    if (recommendationId) {
      recommendationData = await prisma.recommendation.findUnique({
        where: { id: recommendationId },
        include: { agentDebates: true },
      });
    }

    // Generate report content
    const reportResult = generateReport({
      type,
      format: format as "PDF" | "MARKDOWN",
      recommendationId,
      recommendationData: recommendationData
        ? {
            decision: recommendationData.decision,
            tokenSymbol: recommendationData.tokenSymbol,
            tokenName: recommendationData.tokenName,
            allocation: Number(recommendationData.allocationPct),
            confidence: recommendationData.confidence,
            investmentThesis: recommendationData.investmentThesis,
          }
        : undefined,
    });
    const content = reportResult.content;

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

    // Persist report
    const report = await prisma.report.create({
      data: {
        userId: effectiveUserId,
        type,
        format,
        content,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: effectiveUserId,
        action: "REPORT_GENERATED",
        metadata: {
          reportId: report.id,
          type,
          format,
          recommendationId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        type,
        format,
        content,
        createdAt: report.createdAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate report",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
