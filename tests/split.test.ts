import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { splitPdfByRanges, splitEveryN, parseRangeString } from "@/lib/pdf/split";
import { buildBlankPdf } from "@/lib/pdf/blank";

describe("splitPdfByRanges", () => {
  it("splits into ranges with correct page counts", async () => {
    const pdf = await buildBlankPdf(5);
    const parts = await splitPdfByRanges(pdf, [[0, 1], [2, 4]]);
    expect(parts).toHaveLength(2);
    expect((await PDFDocument.load(parts[0])).getPageCount()).toBe(2);
    expect((await PDFDocument.load(parts[1])).getPageCount()).toBe(3);
  });

  it("rejects ranges out of bounds", async () => {
    const pdf = await buildBlankPdf(2);
    await expect(splitPdfByRanges(pdf, [[0, 5]])).rejects.toThrow();
  });
});

describe("splitEveryN", () => {
  it("chunks into N-page pieces with last piece possibly shorter", async () => {
    const pdf = await buildBlankPdf(5);
    const parts = await splitEveryN(pdf, 2);
    expect(parts).toHaveLength(3);
    expect((await PDFDocument.load(parts[2])).getPageCount()).toBe(1);
  });
});

describe("parseRangeString", () => {
  it("parses single, range, and mixed input", () => {
    expect(parseRangeString("1-3,5,7-9", 10)).toEqual([
      [0, 2],
      [4, 4],
      [6, 8],
    ]);
  });

  it("rejects out-of-range pages", () => {
    expect(() => parseRangeString("1-15", 10)).toThrow();
  });

  it("rejects garbage", () => {
    expect(() => parseRangeString("abc", 10)).toThrow();
  });
});
