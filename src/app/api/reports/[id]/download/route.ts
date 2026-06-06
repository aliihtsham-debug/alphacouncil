/**
 * GET /api/reports/:id/download — Download report as PDF or Markdown
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const isPdf = report.format === "PDF";
    const contentType = isPdf ? "application/pdf" : "text/markdown";
    const extension = isPdf ? "pdf" : "md";
    const filename = `alpha-council-${report.type.toLowerCase()}-${report.id.slice(0, 8)}.${extension}`;

    // For PDF, we return the content as a downloadable blob
    // In production, this would use a proper PDF generation library
    const blob = new Blob([report.content], { type: contentType });

    return new Response(blob, {
      headers: {
        "Content-Type": contentType,
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
