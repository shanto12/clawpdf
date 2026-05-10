import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { mergePdfs } from "@/lib/pdf/merge";
import { buildBlankPdf } from "@/lib/pdf/blank";

describe("mergePdfs", () => {
  it("merges two single-page PDFs into one with two pages", async () => {
    const a = await buildBlankPdf(1, "A");
    const b = await buildBlankPdf(1, "B");
    const merged = await mergePdfs([a, b]);
    const doc = await PDFDocument.load(merged);
    expect(doc.getPageCount()).toBe(2);
  });

  it("merges three PDFs in order, page count sums", async () => {
    const a = await buildBlankPdf(2);
    const b = await buildBlankPdf(3);
    const c = await buildBlankPdf(1);
    const merged = await mergePdfs([a, b, c]);
    const doc = await PDFDocument.load(merged);
    expect(doc.getPageCount()).toBe(6);
  });

  it("throws on empty input", async () => {
    await expect(mergePdfs([])).rejects.toThrow();
  });
});
