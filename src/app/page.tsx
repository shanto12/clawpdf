import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

const FEATURES: Array<{ title: string; body: string; icon: string }> = [
  { title: "View & navigate", body: "Smooth multi-page PDFs with thumbnails, zoom, fit-to-width, and keyboard navigation.", icon: "📖" },
  { title: "Annotate", body: "Highlight, underline, strikethrough, free-draw ink, and sticky text notes.", icon: "✍️" },
  { title: "Sign", body: "Draw your signature on a canvas, drop it anywhere, save flattened.", icon: "🖋️" },
  { title: "Merge", body: "Drag-and-drop multiple PDFs together. Reorder by dragging.", icon: "🧩" },
  { title: "Split", body: "Split by ranges (1-3,5,7-9) or every N pages.", icon: "✂️" },
  { title: "Compress", body: "Strip metadata and rebuild with object streams to slim files down.", icon: "🗜️" },
  { title: "OCR", body: "Tesseract.js runs locally — make scanned PDFs searchable.", icon: "🔍" },
  { title: "Convert", body: "PDF → PNG, images → PDF, PDF → plain text.", icon: "🔁" },
  { title: "Forms", body: "Detect AcroForm fields, fill them, optionally flatten.", icon: "📝" },
  { title: "Pages", body: "Rotate, reorder, extract, delete pages.", icon: "🗂️" },
  { title: "Watermark", body: "Add text watermarks, page numbers, headers/footers.", icon: "🏷️" },
  { title: "Add image", body: "Drop a PNG/JPG anywhere on the page and resize.", icon: "🖼️" },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-900 sticky top-0 bg-zinc-950/80 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Logo />
            <span>ClawPDF</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/app" className="text-zinc-300 hover:text-amber-400">Editor</Link>
            <Link href="/download" className="text-zinc-300 hover:text-amber-400">Install</Link>
            <a href="https://github.com/shanto12/clawpdf" className="text-zinc-300 hover:text-amber-400" target="_blank" rel="noreferrer">GitHub</a>
            <Link href="/app">
              <Button size="sm">Open Editor</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <p className="text-amber-500 uppercase tracking-widest text-xs mb-4">Free · Open source · MIT</p>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Edit PDFs in your browser.
          <br />
          <span className="text-amber-400">Nothing ever leaves your device.</span>
        </h1>
        <p className="mt-6 text-zinc-400 text-lg max-w-2xl mx-auto">
          ClawPDF is a fast, privacy-first PDF editor that runs entirely client-side.
          View, annotate, merge, split, sign, compress, OCR, and convert — all without
          uploading a single byte to a server.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link href="/app">
            <Button size="lg">Open editor →</Button>
          </Link>
          <Link href="/download">
            <Button size="lg" variant="outline">Install as app</Button>
          </Link>
        </div>
        <p className="mt-4 text-zinc-500 text-xs">No signup. No upload. Works offline.</p>
      </section>

      <section className="px-6 py-12 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Everything you need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-amber-500/40 transition"
            >
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-2 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 bg-zinc-900/50 border-y border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Why ClawPDF?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-amber-400">Truly private</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Every operation runs in your browser. Your PDFs are never uploaded
                to a server. We don&apos;t even have a server to upload them to.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-amber-400">Works offline</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Install ClawPDF as a PWA and edit PDFs on a plane, in a SCIF, or
                with the Wi-Fi off. The whole app caches locally.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-amber-400">Open source</h3>
              <p className="text-sm text-zinc-400 mt-2">
                MIT-licensed. Audit the code, file an issue, or fork it.
                Built on pdf.js, pdf-lib, and Tesseract.js.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">FAQ</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">Is my data really private?</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Yes. ClawPDF is a static web app — it has no backend. Open the
              network tab while editing and you&apos;ll see your file never leaves
              the browser.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">What size files can I handle?</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Anything up to a few hundred MB on a modern machine. We show a
              warning above 100MB. Performance scales with your CPU and RAM.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Is it really free?</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Forever free, no ads, no signups, no upsells. MIT-licensed source.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Does OCR work offline?</h3>
            <p className="text-sm text-zinc-400 mt-1">
              The Tesseract worker downloads ~5MB of language data on first use,
              then caches it. After that, OCR runs offline.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-6 py-8 text-sm text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span>ClawPDF · © Sprintsite LLC</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-amber-400">Privacy</Link>
            <Link href="/terms" className="hover:text-amber-400">Terms</Link>
            <a href="https://github.com/shanto12/clawpdf" className="hover:text-amber-400" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
