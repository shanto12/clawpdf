"use client";

import { create } from "zustand";

export interface LoadedPdf {
  name: string;
  bytes: Uint8Array;
  size: number;
}

export type Tool =
  | "select"
  | "text"
  | "redact"
  | "highlight"
  | "ink"
  | "signature";

export interface EditorState {
  pdf: LoadedPdf | null;
  pageCount: number;
  currentPage: number;
  zoom: number;
  tool: Tool;
  // pending overlays (applied on flatten/download)
  overlays: Array<{
    id: string;
    type: "text" | "redact" | "image" | "signature";
    pageIndex: number;
    payload: Record<string, unknown>;
  }>;
  setPdf: (p: LoadedPdf | null, pageCount?: number) => void;
  setPageCount: (n: number) => void;
  setCurrentPage: (n: number) => void;
  setZoom: (z: number) => void;
  setTool: (t: Tool) => void;
  addOverlay: (o: EditorState["overlays"][number]) => void;
  removeOverlay: (id: string) => void;
  clearOverlays: () => void;
}

export const useEditor = create<EditorState>((set) => ({
  pdf: null,
  pageCount: 0,
  currentPage: 1,
  zoom: 1,
  tool: "select",
  overlays: [],
  setPdf: (p, pageCount) =>
    set({ pdf: p, currentPage: 1, pageCount: pageCount ?? 0, overlays: [] }),
  setPageCount: (n) => set({ pageCount: n }),
  setCurrentPage: (n) => set({ currentPage: n }),
  setZoom: (z) => set({ zoom: z }),
  setTool: (t) => set({ tool: t }),
  addOverlay: (o) => set((s) => ({ overlays: [...s.overlays, o] })),
  removeOverlay: (id) =>
    set((s) => ({ overlays: s.overlays.filter((o) => o.id !== id) })),
  clearOverlays: () => set({ overlays: [] }),
}));
