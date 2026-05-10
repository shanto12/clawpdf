import { PDFDocument } from "pdf-lib";

/**
 * Merge multiple PDFs (as Uint8Arrays) into one. Returns Uint8Array.
 */
export async function mergePdfs(files: Uint8Array[]): Promise<Uint8Array> {
  if (files.length === 0) throw new Error("No files to merge");
  const out = await PDFDocument.create();
  for (const bytes of files) {
    const src = await PDFDocument.load(bytes);
    const copied = await out.copyPages(src, src.getPageIndices());
    copied.forEach((p) => out.addPage(p));
  }
  return out.save();
}
