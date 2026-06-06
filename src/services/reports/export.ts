/**
 * Report Export Utilities
 *
 * Export reports to various formats.
 * PDF generation uses pdfkit (server-side).
 */

import type { GeneratedReport, ReportData } from "./generator";

// ─── Markdown Export ─────────────────────────────────────

/**
 * Export report as markdown string.
 */
export function exportToMarkdown(report: GeneratedReport): string {
  return report.content;
}

// ─── PDF Export ──────────────────────────────────────────

/**
 * Export report as PDF using pdfkit.
 * Server-side only — returns a Buffer.
 */
export async function exportToPdf(
  report: GeneratedReport,
  data?: ReportData
): Promise<Buffer> {
  const { generatePdf } = await import("./pdf-generator");
  return generatePdf(report, data);
}

// ─── Download Helper ─────────────────────────────────────

/**
 * Trigger a browser download of the report.
 * For PDF, redirects to the server download endpoint.
 */
export function downloadReport(
  report: GeneratedReport,
  filename?: string
): void {
  if (typeof window === "undefined") return;

  if (report.format === "PDF") {
    // For PDF, use the server endpoint
    window.open(`/api/reports/${report.id}/download`, "_blank");
    return;
  }

  // For markdown, create a client-side download
  const ext = "md";
  const mime = "text/markdown";
  const defaultFilename = `alphacouncil-report-${report.id}.${ext}`;

  const blob = new Blob([report.content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
