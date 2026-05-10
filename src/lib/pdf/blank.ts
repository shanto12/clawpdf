import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Build a small test PDF — used as a fallback when a real PDF is needed
 * (e.g. unit tests, demo).
 */
export async function buildBlankPdf(
  pages = 1,
  caption = "ClawPDF",
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([612, 792]);
    page.drawText(`${caption} — page ${i + 1} of ${pages}`, {
      x: 50,
      y: 740,
      size: 18,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  }
  return doc.save();
}
