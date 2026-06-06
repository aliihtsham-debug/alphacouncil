import { describe, it, expect, vi } from "vitest";
import { exportToMarkdown } from "../export";

// Mock pdfkit for the PDF export test
vi.mock("../pdf-generator", () => ({
  generatePdf: vi.fn().mockResolvedValue(Buffer.from("%PDF-1.4 test")),
}));

describe("exportToMarkdown", () => {
  it("returns report content as-is", () => {
    const report = {
      id: "test_123",
      type: "INVESTMENT" as const,
      format: "MARKDOWN" as const,
      content: "# Test Report\n\nHello world",
      createdAt: new Date().toISOString(),
    };

    const result = exportToMarkdown(report);
    expect(result).toBe("# Test Report\n\nHello world");
  });
});

describe("exportToPdf", () => {
  it("returns a Buffer", async () => {
    const { exportToPdf } = await import("../export");
    const report = {
      id: "test_123",
      type: "INVESTMENT" as const,
      format: "PDF" as const,
      content: "# Test Report",
      createdAt: new Date().toISOString(),
    };

    const result = await exportToPdf(report);
    expect(Buffer.isBuffer(result)).toBe(true);
  });
});
