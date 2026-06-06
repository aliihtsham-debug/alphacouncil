/**
 * GET /api/recommendation/:id — Return single recommendation
 * PUT /api/recommendation/:id — Update status (APPROVED/REJECTED/MODIFIED)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "MODIFIED", "EXPIRED"]),
  userId: z.string().optional(),
});

// ─── GET ─────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const rec = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        agentDebates: {
          orderBy: { createdAt: "asc" },
        },
        executedTrade: true,
      },
    });

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
  } catch (error) {
    console.error("Recommendation fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recommendation",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// ─── PUT ─────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const rec = await prisma.recommendation.findUnique({
      where: { id },
    });

    if (!rec) {
      return NextResponse.json(
        { success: false, error: "Recommendation not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

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

    const { status, userId } = parsed.data;

    const updated = await prisma.recommendation.update({
      where: { id },
      data: { status },
      include: {
        agentDebates: {
          orderBy: { createdAt: "asc" },
        },
        executedTrade: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: userId ?? rec.userId,
        action: "RECOMMENDATION_STATUS_UPDATE",
        metadata: {
          recommendationId: id,
          oldStatus: rec.status,
          newStatus: status,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recommendation update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update recommendation",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
