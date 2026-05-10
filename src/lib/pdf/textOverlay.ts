import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface TextOverlay {
  pageIndex: number;
  /** PDF user-space coords, origin bottom-left */
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: { r: number; g: number; b: number };
}

export async function addTextOverlays(
  bytes: Uint8Array,
  overlays: TextOverlay[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  for (const o of overlays) {
    if (o.pageIndex < 0 || o.pageIndex >= pages.length) continue;
    const c = o.color ?? { r: 0, g: 0, b: 0 };
    pages[o.pageIndex].drawText(o.text, {
      x: o.x,
      y: o.y,
      size: o.size ?? 12,
      font,
      color: rgb(c.r, c.g, c.b),
    });
  }
  return doc.save();
}

export interface RedactBox {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: { r: number; g: number; b: number };
}

export async function addRedactBoxes(
  bytes: Uint8Array,
  boxes: RedactBox[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  for (const b of boxes) {
    if (b.pageIndex < 0 || b.pageIndex >= pages.length) continue;
    const c = b.color ?? { r: 0, g: 0, b: 0 };
    pages[b.pageIndex].drawRectangle({
      x: b.x,
      y: b.y,
      width: b.width,
      height: b.height,
      color: rgb(c.r, c.g, c.b),
    });
  }
  return doc.save();
}
