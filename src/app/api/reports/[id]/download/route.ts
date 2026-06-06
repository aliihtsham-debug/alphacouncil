/**
 * GET /api/reports/:id/download — Download report as PDF or Markdown
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exportToPdf } from "@/services/reports/export";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    if (report.format === "PDF") {
      // Generate real PDF
      const pdfBuffer = await exportToPdf({
        id: report.id,
        type: report.type as "INVESTMENT" | "WEEKLY_REBALANCE" | "PORTFOLIO_HEALTH",
        format: "PDF",
        content: report.content,
        createdAt: report.createdAt.toISOString(),
      });

      const filename = `alpha-council-${report.type.toLowerCase()}-${report.id.slice(0, 8)}.pdf`;

      return new Response(pdfBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": pdfBuffer.length.toString(),
        },
      });
    }

    // Markdown download
    const filename = `alpha-council-${report.type.toLowerCase()}-${report.id.slice(0, 8)}.md`;
    const blob = new Blob([report.content], { type: "text/markdown" });

    return new Response(blob, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": blob.size.toString(),
      },
    });
  } catch (error) {
    console.error("Report download error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to download report",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
