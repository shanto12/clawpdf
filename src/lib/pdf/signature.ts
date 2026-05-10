import { PDFDocument } from "pdf-lib";

export interface SignaturePlacement {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Embed a PNG signature image at a placement. signaturePng is raw PNG bytes.
 */
export async function embedSignature(
  pdfBytes: Uint8Array,
  signaturePng: Uint8Array,
  placement: SignaturePlacement,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const png = await doc.embedPng(signaturePng);
  const pages = doc.getPages();
  if (placement.pageIndex < 0 || placement.pageIndex >= pages.length) {
    throw new Error("placement.pageIndex out of range");
  }
  pages[placement.pageIndex].drawImage(png, {
    x: placement.x,
    y: placement.y,
    width: placement.width,
    height: placement.height,
  });
  return doc.save();
}
