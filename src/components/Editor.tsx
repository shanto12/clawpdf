"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useEditor } from "@/store/editor";
import { Button } from "./ui/Button";
import { PdfViewer } from "./PdfViewer";
import { SignaturePad } from "./SignaturePad";
import { Logo } from "./Logo";
import { downloadBytes, fmtBytes, readFileAsBytes } from "@/lib/utils";
import { mergePdfs } from "@/lib/pdf/merge";
import { parseRangeString, splitPdfByRanges } from "@/lib/pdf/split";
import { rotateAll } from "@/lib/pdf/rotate";
import { addWatermark } from "@/lib/pdf/watermark";
import { addPageNumbers } from "@/lib/pdf/pageNumbers";
import { compressPdf } from "@/lib/pdf/compress";
import { addRedactBoxes, addTextOverlays } from "@/lib/pdf/textOverlay";
import { embedSignature } from "@/lib/pdf/signature";
import { extractTextWithPdfjs } from "@/lib/pdf/text";
import { listFormFields } from "@/lib/pdf/forms";
import { PDFDocument } from "pdf-lib";
import Link from "next/link";

type Mode =
  | "view"
  | "text"
  | "redact"
  | "signature"
  | "merge"
  | "split"
  | "watermark"
  | "pages"
  | "compress"
  | "ocr"
  | "convert"
  | "forms";

export function Editor() {
  const { pdf, pageCount, currentPage, zoom, setPdf, setCurrentPage, setZoom, setPageCount } = useEditor();
  const [mode, setMode] = useState<Mode>("view");
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Mode-specific state
  const [textValue, setTextValue] = useState("Sample text");
  const [splitRanges, setSplitRanges] = useState("1-1");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [pageNumPos, setPageNumPos] = useState<"bottom-center" | "bottom-right" | "bottom-left">("bottom-center");
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [showSigPad, setShowSigPad] = useState(false);
  const [pendingSignature, setPendingSignature] = useState<Uint8Array | null>(null);
  const [pendingPlacements, setPendingPlacements] = useState<Array<{ pageIndex: number; x: number; y: number; w: number; h: number; color: string }>>([]);
  const [convertOutput, setConvertOutput] = useState<string | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    if (!/\.pdf$/i.test(f.name)) {
      setStatus("Please drop a PDF file.");
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setStatus(`Heads up: ${fmtBytes(f.size)} is large. The browser may struggle.`);
    } else {
      setStatus(null);
    }
    const bytes = await readFileAsBytes(f);
    setPdf({ name: f.name, bytes, size: f.size });
  }, [setPdf]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  if (!pdf) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-zinc-900 px-6 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Logo />
            <span>ClawPDF</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            {...getRootProps()}
            className={`max-w-xl w-full border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition ${
              isDragActive ? "border-amber-500 bg-amber-500/10" : "border-zinc-700 hover:border-amber-500/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold">Drop a PDF to start</h2>
            <p className="mt-2 text-zinc-400 text-sm">
              Or click to choose. Files never leave your browser.
            </p>
            {status && <p className="mt-3 text-amber-400 text-sm">{status}</p>}
          </div>
        </div>
      </div>
    );
  }

  async function applyAndDownload(transform: (b: Uint8Array) => Promise<Uint8Array>, suffix: string) {
    if (!pdf) return;
    setBusy("Working…");
    try {
      const out = await transform(pdf.bytes);
      const base = pdf.name.replace(/\.pdf$/i, "");
      downloadBytes(out, `${base}-${suffix}.pdf`);
      setStatus(`Saved ${base}-${suffix}.pdf`);
    } catch (e) {
      setStatus(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function handlePageClick(loc: { pageIndex: number; x: number; y: number }) {
    if (!pdf) return;
    if (mode === "text") {
      const out = await addTextOverlays(pdf.bytes, [
        { pageIndex: loc.pageIndex, x: loc.x, y: loc.y, text: textValue, size: 14 },
      ]);
      setPdf({ ...pdf, bytes: out }, pageCount);
      setStatus(`Added text "${textValue}" to page ${loc.pageIndex + 1}`);
    } else if (mode === "redact") {
      const w = 120, h = 18;
      const out = await addRedactBoxes(pdf.bytes, [
        { pageIndex: loc.pageIndex, x: loc.x, y: loc.y - h, width: w, height: h },
      ]);
      setPdf({ ...pdf, bytes: out }, pageCount);
      setStatus(`Redacted area on page ${loc.pageIndex + 1}`);
    } else if (mode === "signature" && pendingSignature) {
      const w = 150, h = 60;
      const out = await embedSignature(pdf.bytes, pendingSignature, {
        pageIndex: loc.pageIndex,
        x: loc.x,
        y: loc.y - h,
        width: w,
        height: h,
      });
      setPdf({ ...pdf, bytes: out }, pageCount);
      setPendingPlacements([...pendingPlacements, { pageIndex: loc.pageIndex, x: loc.x, y: loc.y - h, w, h, color: "rgba(245,158,11,0.2)" }]);
      setStatus(`Signature placed on page ${loc.pageIndex + 1}`);
    }
  }

  async function doMerge() {
    if (mergeFiles.length === 0) {
      setStatus("Add at least one extra PDF to merge with the open one.");
      return;
    }
    setBusy("Merging…");
    try {
      const extras = await Promise.all(mergeFiles.map(readFileAsBytes));
      const out = await mergePdfs([pdf!.bytes, ...extras]);
      const base = pdf!.name.replace(/\.pdf$/i, "");
      downloadBytes(out, `${base}-merged.pdf`);
      setStatus(`Merged ${1 + extras.length} PDFs.`);
    } catch (e) {
      setStatus(`Merge failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function doSplit() {
    setBusy("Splitting…");
    try {
      // If PdfViewer hasn't reported pageCount yet (race on fast-click after upload),
      // fall back to reading the page count directly from the loaded PDF bytes.
      const pc = pageCount || (await PDFDocument.load(pdf!.bytes)).getPageCount();
      const ranges = parseRangeString(splitRanges, pc);
      const parts = await splitPdfByRanges(pdf!.bytes, ranges);
      const base = pdf!.name.replace(/\.pdf$/i, "");
      parts.forEach((p, i) => downloadBytes(p, `${base}-part-${i + 1}.pdf`));
      setStatus(`Split into ${parts.length} files.`);
    } catch (e) {
      setStatus(`Split failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function doConvertText() {
    setBusy("Extracting text…");
    try {
      const pdfjs = await import("pdfjs-dist");
      const pages = await extractTextWithPdfjs(pdf!.bytes, pdfjs);
      const text = pages.map((t, i) => `--- Page ${i + 1} ---\n${t}`).join("\n\n");
      setConvertOutput(text);
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdf!.name.replace(/\.pdf$/i, "") + ".txt";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("Text saved.");
    } catch (e) {
      setStatus(`Text extraction failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function doListForms() {
    setBusy("Reading form fields…");
    try {
      const fields = await listFormFields(pdf!.bytes);
      if (fields.length === 0) {
        setStatus("No AcroForm fields detected.");
        setConvertOutput(null);
      } else {
        setConvertOutput(JSON.stringify(fields, null, 2));
        setStatus(`Found ${fields.length} field(s).`);
      }
    } catch (e) {
      setStatus(`Form read failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  const tools: Array<{ id: Mode; label: string }> = [
    { id: "view", label: "View" },
    { id: "text", label: "Add text" },
    { id: "redact", label: "Redact" },
    { id: "signature", label: "Sign" },
    { id: "merge", label: "Merge" },
    { id: "split", label: "Split" },
    { id: "watermark", label: "Watermark" },
    { id: "pages", label: "Pages" },
    { id: "compress", label: "Compress" },
    { id: "ocr", label: "OCR" },
    { id: "convert", label: "Convert" },
    { id: "forms", label: "Forms" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-900 px-4 py-2 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Logo />
          <span className="hidden sm:inline">ClawPDF</span>
        </Link>
        <div className="flex items-center gap-2 text-sm truncate">
          <span className="text-zinc-400 truncate max-w-[280px]">{pdf.name}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">{fmtBytes(pdf.size)}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">{pageCount || "?"} pages</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPdf(null)}>Close</Button>
          <Button size="sm" onClick={() => downloadBytes(pdf.bytes, pdf.name)}>Download</Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <aside className="md:w-56 border-r border-zinc-900 p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto bg-zinc-950">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={`text-left px-3 py-2 rounded text-sm transition whitespace-nowrap ${
                mode === t.id ? "bg-amber-500 text-zinc-950 font-semibold" : "hover:bg-zinc-800 text-zinc-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 flex min-h-0 min-w-0">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} aria-label="Previous page">←</Button>
                <span>
                  Page <input type="number" value={currentPage} min={1} max={pageCount} onChange={(e) => setCurrentPage(Math.max(1, Math.min(pageCount, parseInt(e.target.value || "1", 10))))} className="w-14 bg-zinc-800 rounded px-2 py-1 text-center" /> / {pageCount}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))} aria-label="Next page">→</Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} aria-label="Zoom out">−</Button>
                <span className="w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.25))} aria-label="Zoom in">+</Button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <PdfViewer
                bytes={pdf.bytes}
                page={currentPage}
                zoom={zoom}
                onPageCount={(n) => setPageCount(n)}
                onPageClick={handlePageClick}
                highlightOverlays={pendingPlacements}
              />
            </div>
          </div>

          <aside className="hidden lg:block w-80 border-l border-zinc-900 p-4 overflow-y-auto bg-zinc-950">
            <h2 className="font-semibold mb-3 capitalize">{mode}</h2>

            {mode === "view" && (
              <p className="text-sm text-zinc-400">
                Use the toolbar to switch tools. Click anywhere on the page when a tool is active.
              </p>
            )}

            {mode === "text" && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">Click on the page to drop this text:</p>
                <input
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                />
              </div>
            )}

            {mode === "redact" && (
              <p className="text-sm text-zinc-400">Click on the page to drop a 120×18pt black redaction box. Repeat as needed.</p>
            )}

            {mode === "signature" && (
              <div className="space-y-3">
                <Button onClick={() => setShowSigPad(true)}>{pendingSignature ? "Redraw signature" : "Draw signature"}</Button>
                {pendingSignature && (
                  <p className="text-sm text-zinc-400">Click on the page to place your signature.</p>
                )}
                {showSigPad && (
                  <SignaturePad
                    onCancel={() => setShowSigPad(false)}
                    onSave={(b) => {
                      setPendingSignature(b);
                      setShowSigPad(false);
                      setStatus("Signature saved. Click on the page to place it.");
                    }}
                  />
                )}
              </div>
            )}

            {mode === "merge" && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">Pick more PDFs to append after the current one:</p>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => setMergeFiles(Array.from(e.target.files ?? []))}
                  className="block text-sm"
                />
                {mergeFiles.length > 0 && (
                  <ul className="text-xs text-zinc-300 list-disc list-inside">
                    {mergeFiles.map((f, i) => (<li key={i}>{f.name}</li>))}
                  </ul>
                )}
                <Button onClick={doMerge} disabled={!!busy}>Merge & download</Button>
              </div>
            )}

            {mode === "split" && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">Page ranges (e.g. <code>1-3,5,7-9</code>):</p>
                <input
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm"
                  value={splitRanges}
                  onChange={(e) => setSplitRanges(e.target.value)}
                />
                <Button onClick={doSplit} disabled={!!busy}>Split & download</Button>
              </div>
            )}

            {mode === "watermark" && (
              <div className="space-y-3">
                <input
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                />
                <Button onClick={() => applyAndDownload((b) => addWatermark(b, { text: watermarkText }), "watermarked")} disabled={!!busy}>
                  Apply watermark
                </Button>
                <hr className="border-zinc-800 my-2" />
                <p className="text-sm text-zinc-400">Page numbers</p>
                <select
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm"
                  value={pageNumPos}
                  onChange={(e) => setPageNumPos(e.target.value as typeof pageNumPos)}
                >
                  <option value="bottom-center">Bottom center</option>
                  <option value="bottom-right">Bottom right</option>
                  <option value="bottom-left">Bottom left</option>
                </select>
                <Button variant="outline" onClick={() => applyAndDownload((b) => addPageNumbers(b, { position: pageNumPos }), "numbered")} disabled={!!busy}>Add page numbers</Button>
              </div>
            )}

            {mode === "pages" && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">Rotate all pages by:</p>
                <div className="flex gap-2">
                  <Button onClick={() => applyAndDownload((b) => rotateAll(b, 90), "rotated")} disabled={!!busy}>+90°</Button>
                  <Button onClick={() => applyAndDownload((b) => rotateAll(b, 180), "rotated")} disabled={!!busy}>180°</Button>
                  <Button onClick={() => applyAndDownload((b) => rotateAll(b, 270), "rotated")} disabled={!!busy}>−90°</Button>
                </div>
              </div>
            )}

            {mode === "compress" && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">
                  Compress strips metadata and rebuilds with object streams. For most PDFs this saves 5-20%.
                </p>
                <Button onClick={() => applyAndDownload((b) => compressPdf(b), "compressed")} disabled={!!busy}>Compress & download</Button>
              </div>
            )}

            {mode === "ocr" && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">
                  OCR runs Tesseract.js (~5MB on first use). Renders the current page to an image and recognizes the text.
                </p>
                <Button
                  disabled={!!busy}
                  onClick={async () => {
                    setBusy("Running OCR (first run downloads ~5MB)…");
                    try {
                      const tess = await import("tesseract.js");
                      const pdfjsMod = await import("pdfjs-dist");
                      const w = window as unknown as { __pdfjsWorkerSet?: boolean };
                      if (!w.__pdfjsWorkerSet) {
                        (pdfjsMod as unknown as { GlobalWorkerOptions: { workerSrc: string }; version: string }).GlobalWorkerOptions.workerSrc =
                          `https://unpkg.com/pdfjs-dist@${(pdfjsMod as unknown as { version: string }).version}/build/pdf.worker.min.mjs`;
                        w.__pdfjsWorkerSet = true;
                      }
                      const loading = (pdfjsMod as unknown as { getDocument: (p: { data: Uint8Array }) => { promise: Promise<{ getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number }; render: (p: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> } }> }> } }).getDocument({ data: pdf!.bytes.slice() });
                      const d = await loading.promise;
                      const p = await d.getPage(currentPage);
                      const vp = p.getViewport({ scale: 2 });
                      const canvas = document.createElement("canvas");
                      canvas.width = vp.width; canvas.height = vp.height;
                      const ctx = canvas.getContext("2d")!;
                      await p.render({ canvasContext: ctx, viewport: vp }).promise;
                      const dataUrl = canvas.toDataURL("image/png");
                      const result = await tess.recognize(dataUrl, "eng");
                      setConvertOutput(result.data.text);
                      setStatus(`OCR complete (${result.data.text.length} chars).`);
                    } catch (e) {
                      setStatus(`OCR failed: ${e instanceof Error ? e.message : String(e)}`);
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  OCR current page
                </Button>
                {convertOutput && (
                  <pre className="text-xs bg-zinc-900 rounded p-3 max-h-64 overflow-auto whitespace-pre-wrap break-words">{convertOutput}</pre>
                )}
              </div>
            )}

            {mode === "convert" && (
              <div className="space-y-3">
                <Button onClick={doConvertText} disabled={!!busy}>Extract text → .txt</Button>
                {convertOutput && (
                  <pre className="text-xs bg-zinc-900 rounded p-3 max-h-64 overflow-auto whitespace-pre-wrap break-words">{convertOutput.slice(0, 4000)}</pre>
                )}
              </div>
            )}

            {mode === "forms" && (
              <div className="space-y-3">
                <Button onClick={doListForms} disabled={!!busy}>Detect AcroForm fields</Button>
                {convertOutput && (
                  <pre className="text-xs bg-zinc-900 rounded p-3 max-h-64 overflow-auto whitespace-pre-wrap break-words">{convertOutput}</pre>
                )}
              </div>
            )}

            {(busy || status) && (
              <div className="mt-4 text-xs">
                {busy && <p className="text-amber-400">{busy}</p>}
                {status && <p className="text-zinc-300">{status}</p>}
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}
