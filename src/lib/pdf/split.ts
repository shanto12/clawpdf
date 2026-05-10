import { PDFDocument } from "pdf-lib";

/**
 * Split a PDF into N PDFs by ranges. Each range is [startIdx, endIdxInclusive] (0-based).
 * Returns array of Uint8Array PDFs in input order.
 */
export async function splitPdfByRanges(
  bytes: Uint8Array,
  ranges: Array<[number, number]>,
): Promise<Uint8Array[]> {
  const src = await PDFDocument.load(bytes);
  const pageCount = src.getPageCount();
  const out: Uint8Array[] = [];
  for (const [start, end] of ranges) {
    if (start < 0 || end < start || end >= pageCount) {
      throw new Error(`Invalid range [${start}, ${end}]; pageCount=${pageCount}`);
    }
    const dst = await PDFDocument.create();
    const indices: number[] = [];
    for (let i = start; i <= end; i++) indices.push(i);
    const pages = await dst.copyPages(src, indices);
    pages.forEach((p) => dst.addPage(p));
    out.push(await dst.save());
  }
  return out;
}

/** Split every N pages */
export async function splitEveryN(
  bytes: Uint8Array,
  n: number,
): Promise<Uint8Array[]> {
  if (n <= 0) throw new Error("n must be > 0");
  const src = await PDFDocument.load(bytes);
  const pageCount = src.getPageCount();
  const ranges: Array<[number, number]> = [];
  for (let start = 0; start < pageCount; start += n) {
    ranges.push([start, Math.min(pageCount - 1, start + n - 1)]);
  }
  return splitPdfByRanges(bytes, ranges);
}

/**
 * Parse a "1-3,5,7-9" page range string (1-based) into 0-based [start, end] tuples.
 */
export function parseRangeString(input: string, pageCount: number): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (const chunk of input.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (chunk.includes("-")) {
      const [a, b] = chunk.split("-").map((s) => parseInt(s.trim(), 10));
      if (Number.isNaN(a) || Number.isNaN(b)) throw new Error(`Bad range: ${chunk}`);
      result.push([a - 1, b - 1]);
    } else {
      const a = parseInt(chunk, 10);
      if (Number.isNaN(a)) throw new Error(`Bad page: ${chunk}`);
      result.push([a - 1, a - 1]);
    }
  }
  for (const [s, e] of result) {
    if (s < 0 || e >= pageCount || s > e) throw new Error(`Out-of-range: ${s + 1}-${e + 1}`);
  }
  return result;
}
