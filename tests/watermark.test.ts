import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { addWatermark } from "@/lib/pdf/watermark";
import { addPageNumbers } from "@/lib/pdf/pageNumbers";
import { buildBlankPdf } from "@/lib/pdf/blank";

describe("watermark", () => {
  it("adds a watermark and produces a valid PDF", async () => {
    const pdf = await buildBlankPdf(2);
    const out = await addWatermark(pdf, { text: "DRAFT" });
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });
});

describe("addPageNumbers", () => {
  it("preserves page count", async () => {
    const pdf = await buildBlankPdf(4);
    const out = await addPageNumbers(pdf, { position: "bottom-center" });
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(4);
  });
});
