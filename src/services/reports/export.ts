/**
 * Report Export Utilities
 *
 * Export reports to various formats.
 * PDF generation is a placeholder — returns markdown for now.
 */

import type { GeneratedReport } from "./generator";

// ─── Markdown Export ─────────────────────────────────────

/**
 * Export report as markdown string.
 */
export function exportToMarkdown(report: GeneratedReport): string {
  return report.content;
}

// ─── PDF Export (placeholder) ────────────────────────────

/**
 * Export report as PDF.
 * In production, this would use a library like pdfkit or puppeteer.
 * For now, returns the markdown content with a note.
 */
export async function exportToPdf(report: GeneratedReport): Promise<Blob> {
  // Placeholder: return markdown as text blob
  // In production:
  // 1. Convert markdown to HTML
  // 2. Use puppeteer to render HTML to PDF
  // 3. Return PDF blob

  const pdfContent = [
    `%PDF-1.4`,
    report.content,
    "",
    "---",
    "Note: PDF generation is a placeholder. In production, this would render a formatted PDF.",
  ].join("\n");

  return new Blob([pdfContent], { type: "application/pdf" });
}

// ─── Download Helper ─────────────────────────────────────

/**
 * Trigger a browser download of the report.
 */
export function downloadReport(
  report: GeneratedReport,
  filename?: string
): void {
  const isPdf = report.format === "PDF";
  const ext = isPdf ? "pdf" : "md";
  const mime = isPdf ? "application/pdf" : "text/markdown";
  const defaultFilename = `alphacouncil-report-${report.id}.${ext}`;

  // In browser environment
  if (typeof window === "undefined") return;

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
