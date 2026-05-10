import { PDFDocument } from "pdf-lib";

/**
 * Lightweight "compression" pass: re-saves the PDF with object streams enabled.
 * Real image-recompression requires re-encoding embedded JPGs, which is complex
 * and brittle. We expose a quality knob that future versions can use; today,
 * we run pdf-lib's compact save and strip metadata to give a measurable win.
 */
export async function compressPdf(
  bytes: Uint8Array,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _quality = 60, // reserved for future image-quality work
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  // Strip producer/creator metadata; small but real.
  doc.setProducer("ClawPDF");
  doc.setCreator("ClawPDF");
  // Object streams reduce overhead.
  return doc.save({ useObjectStreams: true });
}
