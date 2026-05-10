"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";

export function SignaturePad({
  onSave,
  onCancel,
}: {
  onSave: (pngBytes: Uint8Array) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = 600;
    c.height = 300;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 600,
      y: ((e.clientY - r.top) / r.height) * 300,
    };
  }

  function clear() {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
    setHasInk(false);
  }

  async function save() {
    const c = ref.current!;
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png"));
    if (!blob) return;
    const buf = new Uint8Array(await blob.arrayBuffer());
    onSave(buf);
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-2xl w-full">
        <h3 className="text-lg font-semibold mb-3">Draw your signature</h3>
        <canvas
          ref={ref}
          className="bg-white rounded w-full max-w-full touch-none"
          style={{ aspectRatio: "2 / 1" }}
          onPointerDown={(e) => {
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
            const ctx = ref.current!.getContext("2d")!;
            const { x, y } = pos(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
            setDrawing(true);
          }}
          onPointerMove={(e) => {
            if (!drawing) return;
            const ctx = ref.current!.getContext("2d")!;
            const { x, y } = pos(e);
            ctx.lineTo(x, y);
            ctx.stroke();
            setHasInk(true);
          }}
          onPointerUp={() => setDrawing(false)}
          onPointerCancel={() => setDrawing(false)}
        />
        <div className="mt-4 flex justify-between gap-2">
          <Button variant="ghost" onClick={clear}>Clear</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={save} disabled={!hasInk}>Save signature</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
