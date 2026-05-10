import { PDFDocument, degrees } from "pdf-lib";

export async function rotatePages(
  bytes: Uint8Array,
  pageIndices: number[],
  delta: number,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  for (const idx of pageIndices) {
    if (idx < 0 || idx >= pages.length) continue;
    const current = pages[idx].getRotation().angle;
    pages[idx].setRotation(degrees((current + delta) % 360));
  }
  return doc.save();
}

export async function rotateAll(
  bytes: Uint8Array,
  delta: number,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  pages.forEach((p) => {
    const cur = p.getRotation().angle;
    p.setRotation(degrees((cur + delta) % 360));
  });
  return doc.save();
}
