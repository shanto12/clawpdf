import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export interface WatermarkOptions {
  text: string;
  opacity?: number; // 0..1
  fontSize?: number;
  rotate?: number; // degrees
  color?: { r: number; g: number; b: number }; // 0..1
}

export async function addWatermark(
  bytes: Uint8Array,
  opts: WatermarkOptions,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const opacity = opts.opacity ?? 0.25;
  const fontSize = opts.fontSize ?? 60;
  const rotate = opts.rotate ?? 45;
  const color = opts.color ?? { r: 0.6, g: 0.6, b: 0.6 };
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const tw = font.widthOfTextAtSize(opts.text, fontSize);
    page.drawText(opts.text, {
      x: width / 2 - tw / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(rotate),
    });
  }
  return doc.save();
}
