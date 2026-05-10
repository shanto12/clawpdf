import { PDFDocument } from "pdf-lib";

export interface ImageInsertion {
  pageIndex: number;
  bytes: Uint8Array;
  type: "png" | "jpg";
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function insertImages(
  pdfBytes: Uint8Array,
  insertions: ImageInsertion[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const pages = doc.getPages();
  for (const ins of insertions) {
    if (ins.pageIndex < 0 || ins.pageIndex >= pages.length) continue;
    const img =
      ins.type === "png"
        ? await doc.embedPng(ins.bytes)
        : await doc.embedJpg(ins.bytes);
    pages[ins.pageIndex].drawImage(img, {
      x: ins.x,
      y: ins.y,
      width: ins.width,
      height: ins.height,
    });
  }
  return doc.save();
}

/**
 * Build a PDF from images. Each image becomes one page.
 */
export async function imagesToPdf(
  images: Array<{ bytes: Uint8Array; type: "png" | "jpg" }>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const img of images) {
    const embedded =
      img.type === "png"
        ? await doc.embedPng(img.bytes)
        : await doc.embedJpg(img.bytes);
    const page = doc.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    });
  }
  return doc.save();
}
