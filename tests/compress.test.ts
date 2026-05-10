import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { compressPdf } from "@/lib/pdf/compress";
import { buildBlankPdf } from "@/lib/pdf/blank";

describe("compress", () => {
  it("returns a valid PDF preserving page count", async () => {
    const pdf = await buildBlankPdf(3);
    const out = await compressPdf(pdf);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(3);
  });
});
