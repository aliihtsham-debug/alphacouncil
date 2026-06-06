/**
 * Real PDF Generator
 *
 * Generates professional investment reports using pdfkit.
 * Server-side only — runs in API routes.
 */

import type { GeneratedReport, ReportData } from "./generator";

/**
 * Generate a professional PDF report.
 * Returns a Buffer containing the PDF data.
 */
export async function generatePdf(
  report: GeneratedReport,
  data?: ReportData
): Promise<Buffer> {
  const PDFDocument = (await import("pdfkit")).default;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 2 * doc.page.margins.left;

    // ─── Header ──────────────────────────────────────────
    // Dark background bar
    doc.rect(0, 0, doc.page.width, 80).fill("#1a1a2e");

    // Title
    doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold");
    doc.text("ALPHA COUNCIL", 50, 20);

    // Subtitle
    doc.fillColor("#a0a0b0").fontSize(10).font("Helvetica");
    doc.text("AI-Powered Investment Committee", 50, 50);

    // Report type badge
    const reportTypeLabel = formatReportType(report.type);
    doc.fillColor("#4f46e5").fontSize(11).font("Helvetica-Bold");
    doc.text(reportTypeLabel.toUpperCase(), 400, 30, { align: "right" });

    // Date
    doc.fillColor("#a0a0b0").fontSize(9).font("Helvetica");
    doc.text(
      `Generated: ${new Date(report.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      400,
      48,
      { align: "right" }
    );

    doc.y = 100;

    // ─── Portfolio Overview ──────────────────────────────
    if (data?.portfolioData) {
      doc.fillColor("#1a1a2e").fontSize(16).font("Helvetica-Bold");
      doc.text("Portfolio Overview", 50, doc.y);
      doc.moveDown(0.5);

      // Stats boxes
      const boxY = doc.y;
      const boxWidth = (pageWidth - 20) / 3;

      // Total Value
      drawStatBox(
        doc,
        50,
        boxY,
        boxWidth,
        "Total Value",
        `$${data.portfolioData.totalValueUsd.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      );

      // Risk Score
      drawStatBox(
        doc,
        50 + boxWidth + 10,
        boxY,
        boxWidth,
        "Risk Score",
        `${data.portfolioData.riskScore}/100`
      );

      // Number of Assets
      drawStatBox(
        doc,
        50 + 2 * (boxWidth + 10),
        boxY,
        boxWidth,
        "Assets",
        `${data.portfolioData.assets.length}`
      );

      doc.y = boxY + 60;

      // Holdings table
      doc.moveDown(0.5);
      doc.fillColor("#1a1a2e").fontSize(14).font("Helvetica-Bold");
      doc.text("Holdings");
      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      const colWidths = [
        pageWidth * 0.15, // Symbol
        pageWidth * 0.25, // Name
        pageWidth * 0.15, // Allocation
        pageWidth * 0.20, // Value
        pageWidth * 0.25, // Sector
      ];

      doc.fillColor("#f0f0f0").rect(50, tableTop, pageWidth, 20).fill();
      doc.fillColor("#1a1a2e").fontSize(9).font("Helvetica-Bold");

      let colX = 55;
      doc.text("Asset", colX, tableTop + 5, {
        width: colWidths[0],
        align: "left",
      });
      colX += colWidths[0];
      doc.text("Name", colX, tableTop + 5, {
        width: colWidths[1],
        align: "left",
      });
      colX += colWidths[1];
      doc.text("Alloc %", colX, tableTop + 5, {
        width: colWidths[2],
        align: "right",
      });
      colX += colWidths[2];
      doc.text("Value", colX, tableTop + 5, {
        width: colWidths[3],
        align: "right",
      });
      colX += colWidths[3];
      doc.text("Sector", colX, tableTop + 5, {
        width: colWidths[4],
        align: "left",
      });

      // Table rows
      doc.font("Helvetica").fontSize(9).fillColor("#333333");
      let rowY = tableTop + 22;

      for (const asset of data.portfolioData.assets) {
        if (rowY > doc.page.height - 100) {
          doc.addPage();
          rowY = 50;
        }

        colX = 55;
        doc.text(asset.tokenSymbol, colX, rowY, {
          width: colWidths[0],
          align: "left",
        });
        colX += colWidths[0];
        doc.text(asset.tokenName, colX, rowY, {
          width: colWidths[1],
          align: "left",
        });
        colX += colWidths[1];
        doc.text(`${(asset.allocationPct * 100).toFixed(1)}%`, colX, rowY, {
          width: colWidths[2],
          align: "right",
        });
        colX += colWidths[2];
        doc.text(
          `$${asset.valueUsd.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          colX,
          rowY,
          { width: colWidths[3], align: "right" }
        );
        colX += colWidths[3];
        doc.text(asset.sector, colX, rowY, {
          width: colWidths[4],
          align: "left",
        });

        rowY += 16;
      }

      doc.y = rowY + 20;
    }

    // ─── Recommendation ──────────────────────────────────
    if (data?.recommendationData) {
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      }

      doc.fillColor("#1a1a2e").fontSize(16).font("Helvetica-Bold");
      doc.text("Recommendation");
      doc.moveDown(0.5);

      // Decision badge
      const decision = data.recommendationData.decision;
      const decisionColor =
        decision === "BUY"
          ? "#10b981"
          : decision === "SELL"
            ? "#ef4444"
            : "#f59e0b";

      const badgeX = 50;
      const badgeY = doc.y;
      doc.fillColor(decisionColor)
        .roundedRect(badgeX, badgeY, 60, 22, 4)
        .fill();
      doc.fillColor("#ffffff")
        .fontSize(11)
        .font("Helvetica-Bold");
      doc.text(decision, badgeX, badgeY + 5, {
        width: 60,
        align: "center",
      });

      // Token info
      doc.fillColor("#1a1a2e")
        .fontSize(14)
        .font("Helvetica-Bold");
      doc.text(
        `${data.recommendationData.tokenName} (${data.recommendationData.tokenSymbol})`,
        badgeX + 70,
        badgeY + 3
      );

      doc.y = badgeY + 35;

      // Stats
      doc.fontSize(10).font("Helvetica");
      doc.fillColor("#666666");
      doc.text(
        `Allocation: ${data.recommendationData.allocation}%  |  Confidence: ${data.recommendationData.confidence}%`
      );

      doc.moveDown(1);

      // Investment Thesis
      doc.fillColor("#1a1a2e").fontSize(12).font("Helvetica-Bold");
      doc.text("Investment Thesis");
      doc.moveDown(0.3);

      doc.fillColor("#333333").fontSize(10).font("Helvetica");
      doc.text(data.recommendationData.investmentThesis, {
        align: "justify",
        lineGap: 2,
      });
    }

    // ─── Footer ──────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);

      // Footer line
      doc.strokeColor("#e0e0e0")
        .lineWidth(0.5)
        .moveTo(50, doc.page.height - 60)
        .lineTo(doc.page.width - 50, doc.page.height - 60)
        .stroke();

      // Disclaimer
      doc.fillColor("#999999")
        .fontSize(7)
        .font("Helvetica");
      doc.text(
        "This report was generated by Alpha Council's AI committee. Past performance does not guarantee future results. This is not financial advice.",
        50,
        doc.page.height - 50,
        { align: "center", width: pageWidth }
      );

      // Page number
      doc.text(
        `Page ${i + 1} of ${range.count}`,
        50,
        doc.page.height - 35,
        { align: "right", width: pageWidth }
      );
    }

    doc.end();
  });
}

// ─── Helpers ────────────────────────────────────────────

function drawStatBox(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string
) {
  // Background
  doc.fillColor("#f8f9fa")
    .roundedRect(x, y, width, 45, 4)
    .fill();

  // Border
  doc.strokeColor("#e9e9e9")
    .lineWidth(0.5)
    .roundedRect(x, y, width, 45, 4)
    .stroke();

  // Label
  doc.fillColor("#666666").fontSize(8).font("Helvetica");
  doc.text(label, x + 10, y + 8);

  // Value
  doc.fillColor("#1a1a2e").fontSize(14).font("Helvetica-Bold");
  doc.text(value, x + 10, y + 22);
}

function formatReportType(type: string): string {
  switch (type) {
    case "INVESTMENT":
      return "Investment Analysis";
    case "WEEKLY_REBALANCE":
      return "Weekly Rebalance";
    case "PORTFOLIO_HEALTH":
      return "Portfolio Health Check";
    default:
      return type;
  }
}
