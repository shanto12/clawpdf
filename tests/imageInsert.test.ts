import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { imagesToPdf } from "@/lib/pdf/imageInsert";
import sharp from "sharp";

describe("imagesToPdf", () => {
  it("creates a multi-page PDF from images", async () => {
    const png1 = await sharp({
      create: { width: 200, height: 200, channels: 3, background: "#ff0000" },
    }).png().toBuffer();
    const png2 = await sharp({
      create: { width: 200, height: 200, channels: 3, background: "#00ff00" },
    }).png().toBuffer();
    const out = await imagesToPdf([
      { bytes: new Uint8Array(png1), type: "png" },
      { bytes: new Uint8Array(png2), type: "png" },
    ]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });
});
