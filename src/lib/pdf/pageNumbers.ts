import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type Position = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";

export interface PageNumberOptions {
  position?: Position;
  fontSize?: number;
  format?: (n: number, total: number) => string;
  startAt?: number;
  marginX?: number;
  marginY?: number;
}

export async function addPageNumbers(
  bytes: Uint8Array,
  opts: PageNumberOptions = {},
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  const fontSize = opts.fontSize ?? 11;
  const fmt = opts.format ?? ((n, t) => `${n} / ${t}`);
  const startAt = opts.startAt ?? 1;
  const mx = opts.marginX ?? 36;
  const my = opts.marginY ?? 24;
  const pos = opts.position ?? "bottom-center";

  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const text = fmt(i + startAt, total);
    const tw = font.widthOfTextAtSize(text, fontSize);
    let x = width / 2 - tw / 2;
    let y = my;
    if (pos === "bottom-right") x = width - tw - mx;
    if (pos === "bottom-left") x = mx;
    if (pos.startsWith("top")) y = height - my - fontSize;
    if (pos === "top-right") x = width - tw - mx;
    if (pos === "top-left") x = mx;
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  });

  return doc.save();
}
