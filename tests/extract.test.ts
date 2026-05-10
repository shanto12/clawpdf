import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { extractPages, deletePages, reorderPages } from "@/lib/pdf/extract";
import { buildBlankPdf } from "@/lib/pdf/blank";

describe("extractPages", () => {
  it("extracts a subset", async () => {
    const pdf = await buildBlankPdf(5);
    const out = await extractPages(pdf, [0, 2, 4]);
    expect((await PDFDocument.load(out)).getPageCount()).toBe(3);
  });
});

describe("deletePages", () => {
  it("removes specified pages", async () => {
    const pdf = await buildBlankPdf(5);
    const out = await deletePages(pdf, [1, 3]);
    expect((await PDFDocument.load(out)).getPageCount()).toBe(3);
  });
});

describe("reorderPages", () => {
  it("reorders by indices", async () => {
    const pdf = await buildBlankPdf(3);
    const out = await reorderPages(pdf, [2, 0, 1]);
    expect((await PDFDocument.load(out)).getPageCount()).toBe(3);
  });
});
