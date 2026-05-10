/**
 * Extract plain text from a PDF using pdfjs-dist text content.
 * Browser-only — pdfjs requires a worker.
 */
export async function extractTextWithPdfjs(
  bytes: Uint8Array,
  pdfjs: typeof import("pdfjs-dist"),
): Promise<string[]> {
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const doc = await loadingTask.promise;
  const out: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    const lineMap: Record<number, string[]> = {};
    for (const item of tc.items as Array<{ str: string; transform: number[] }>) {
      const y = Math.round((item.transform?.[5] ?? 0) * 10) / 10;
      lineMap[y] = lineMap[y] || [];
      lineMap[y].push(item.str);
    }
    const lines = Object.entries(lineMap)
      .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
      .map(([, parts]) => parts.join(" "));
    out.push(lines.join("\n"));
  }
  return out;
}
