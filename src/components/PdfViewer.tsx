"use client";

import { useEffect, useRef, useState } from "react";

export interface PdfViewerProps {
  bytes: Uint8Array;
  page: number;
  zoom: number;
  onPageCount?: (n: number) => void;
  onPageClick?: (e: { pageIndex: number; x: number; y: number; pageWidthPt: number; pageHeightPt: number }) => void;
  highlightOverlays?: Array<{ pageIndex: number; x: number; y: number; w: number; h: number; color: string }>;
}

interface PdfjsModule {
  getDocument: (params: { data: Uint8Array }) => { promise: Promise<PdfjsDoc> };
  GlobalWorkerOptions: { workerSrc: string };
  version: string;
}

interface PdfjsDoc {
  numPages: number;
  getPage: (n: number) => Promise<PdfjsPage>;
}

interface PdfjsPage {
  getViewport: (opts: { scale: number }) => { width: number; height: number; height_pt?: number };
  view?: number[];
  render: (params: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
}

let cachedPdfjs: PdfjsModule | null = null;

async function getPdfjs(): Promise<PdfjsModule> {
  if (cachedPdfjs) return cachedPdfjs;
  const mod = (await import("pdfjs-dist")) as unknown as PdfjsModule;
  if (typeof window !== "undefined") {
    // Use the same-version worker from unpkg for static export reliability
    mod.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.version}/build/pdf.worker.min.mjs`;
  }
  cachedPdfjs = mod;
  return mod;
}

export function PdfViewer({ bytes, page, zoom, onPageCount, onPageClick, highlightOverlays }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [doc, setDoc] = useState<PdfjsDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageSizePt, setPageSizePt] = useState({ w: 0, h: 0 });
  const [renderedSize, setRenderedSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const pdfjs = await getPdfjs();
        const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
        const d = await loadingTask.promise;
        if (cancelled) return;
        setDoc(d);
        onPageCount?.(d.numPages);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bytes]);

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await doc.getPage(page);
        if (cancelled) return;
        const viewport = p.getViewport({ scale: zoom * 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / 1.5}px`;
        canvas.style.height = `${viewport.height / 1.5}px`;
        await p.render({ canvasContext: ctx, viewport }).promise;
        // Page size in PDF user-space points
        const view = p.view ?? [0, 0, viewport.width, viewport.height];
        setPageSizePt({ w: view[2] - view[0], h: view[3] - view[1] });
        setRenderedSize({ w: viewport.width / 1.5, h: viewport.height / 1.5 });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, page, zoom]);

  function handleClick(ev: React.MouseEvent<HTMLCanvasElement>) {
    if (!onPageClick || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    // Convert from CSS px to PDF points (origin top-left in CSS, bottom-left in PDF)
    const xPt = (px / rect.width) * pageSizePt.w;
    const yPt = pageSizePt.h - (py / rect.height) * pageSizePt.h;
    onPageClick({ pageIndex: page - 1, x: xPt, y: yPt, pageWidthPt: pageSizePt.w, pageHeightPt: pageSizePt.h });
  }

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto bg-zinc-900 p-6 flex justify-center">
      {error && (
        <div className="text-red-400 text-sm">Failed to render PDF: {error}</div>
      )}
      <div className="relative shadow-2xl">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="bg-white block"
          aria-label={`PDF page ${page}`}
        />
        {highlightOverlays?.filter((h) => h.pageIndex === page - 1).map((h, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(h.x / pageSizePt.w) * renderedSize.w}px`,
              top: `${((pageSizePt.h - h.y - h.h) / pageSizePt.h) * renderedSize.h}px`,
              width: `${(h.w / pageSizePt.w) * renderedSize.w}px`,
              height: `${(h.h / pageSizePt.h) * renderedSize.h}px`,
              background: h.color,
              pointerEvents: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
