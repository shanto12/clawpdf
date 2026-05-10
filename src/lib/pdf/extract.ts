import { PDFDocument } from "pdf-lib";

/** Extract specified 0-based pages into a new PDF */
export async function extractPages(
  bytes: Uint8Array,
  pageIndices: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes);
  const dst = await PDFDocument.create();
  const valid = pageIndices.filter((i) => i >= 0 && i < src.getPageCount());
  const pages = await dst.copyPages(src, valid);
  pages.forEach((p) => dst.addPage(p));
  return dst.save();
}

/** Reorder pages: order is an array of original 0-based indices in their new positions */
export async function reorderPages(
  bytes: Uint8Array,
  order: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes);
  const dst = await PDFDocument.create();
  const pages = await dst.copyPages(src, order);
  pages.forEach((p) => dst.addPage(p));
  return dst.save();
}

/** Delete pages */
export async function deletePages(
  bytes: Uint8Array,
  pageIndices: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();
  const drop = new Set(pageIndices);
  const keep: number[] = [];
  for (let i = 0; i < total; i++) if (!drop.has(i)) keep.push(i);
  const dst = await PDFDocument.create();
  const pages = await dst.copyPages(src, keep);
  pages.forEach((p) => dst.addPage(p));
  return dst.save();
}
