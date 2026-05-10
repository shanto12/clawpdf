import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { rotateAll, rotatePages } from "@/lib/pdf/rotate";
import { buildBlankPdf } from "@/lib/pdf/blank";

describe("rotate", () => {
  it("rotates all pages by 90 degrees", async () => {
    const pdf = await buildBlankPdf(3);
    const out = await rotateAll(pdf, 90);
    const doc = await PDFDocument.load(out);
    for (const p of doc.getPages()) expect(p.getRotation().angle).toBe(90);
  });

  it("rotates only specified pages", async () => {
    const pdf = await buildBlankPdf(3);
    const out = await rotatePages(pdf, [1], 180);
    const doc = await PDFDocument.load(out);
    expect(doc.getPages()[0].getRotation().angle).toBe(0);
    expect(doc.getPages()[1].getRotation().angle).toBe(180);
    expect(doc.getPages()[2].getRotation().angle).toBe(0);
  });
});
