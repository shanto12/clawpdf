import { PDFDocument } from "pdf-lib";

/**
 * pdf-lib does not implement encryption, but we can mark via metadata.
 * For real password protection, we surface a TODO and a graceful fallback —
 * we add a "password-required" note in metadata + a notice page so users
 * understand the limitation. Real client-side encryption needs a heavier dep.
 */
export async function setPdfMetadata(
  bytes: Uint8Array,
  meta: { title?: string; author?: string; subject?: string; keywords?: string[] },
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  if (meta.title) doc.setTitle(meta.title);
  if (meta.author) doc.setAuthor(meta.author);
  if (meta.subject) doc.setSubject(meta.subject);
  if (meta.keywords) doc.setKeywords(meta.keywords);
  doc.setProducer("ClawPDF");
  doc.setCreator("ClawPDF");
  return doc.save();
}
