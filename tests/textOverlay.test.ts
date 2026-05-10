import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { addTextOverlays, addRedactBoxes } from "@/lib/pdf/textOverlay";
import { buildBlankPdf } from "@/lib/pdf/blank";

describe("text overlays", () => {
  it("adds text without changing page count", async () => {
    const pdf = await buildBlankPdf(2);
    const out = await addTextOverlays(pdf, [
      { pageIndex: 0, x: 100, y: 200, text: "hello" },
      { pageIndex: 1, x: 50, y: 50, text: "world", size: 20 },
    ]);
    expect((await PDFDocument.load(out)).getPageCount()).toBe(2);
  });

  it("ignores out-of-range page indices", async () => {
    const pdf = await buildBlankPdf(1);
    const out = await addTextOverlays(pdf, [
      { pageIndex: 5, x: 0, y: 0, text: "ignored" },
    ]);
    expect((await PDFDocument.load(out)).getPageCount()).toBe(1);
  });
});

describe("redact boxes", () => {
  it("draws redact boxes", async () => {
    const pdf = await buildBlankPdf(1);
    const out = await addRedactBoxes(pdf, [
      { pageIndex: 0, x: 100, y: 100, width: 50, height: 20 },
    ]);
    expect((await PDFDocument.load(out)).getPageCount()).toBe(1);
  });
});
