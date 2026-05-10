import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Download() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <Link href="/" className="flex items-center gap-2 font-bold mb-10"><Logo /><span>ClawPDF</span></Link>
      <h1 className="text-4xl font-bold">Install ClawPDF</h1>
      <p className="text-zinc-400 mt-3">
        ClawPDF is a Progressive Web App. Install it once and it works offline,
        launches from your dock, and runs in its own window.
      </p>

      <section className="mt-10 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-amber-400">Chrome / Edge (desktop)</h2>
          <ol className="list-decimal list-inside text-zinc-300 mt-2 text-sm space-y-1">
            <li>Open <Link className="underline" href="/app">the editor</Link>.</li>
            <li>Click the install icon in the address bar (a monitor with a down arrow).</li>
            <li>Confirm.</li>
          </ol>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-amber-400">Safari (macOS)</h2>
          <ol className="list-decimal list-inside text-zinc-300 mt-2 text-sm space-y-1">
            <li>Open the editor in Safari.</li>
            <li>File → Add to Dock.</li>
          </ol>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-amber-400">iOS / iPadOS</h2>
          <ol className="list-decimal list-inside text-zinc-300 mt-2 text-sm space-y-1">
            <li>Open the editor in Safari.</li>
            <li>Tap the Share button.</li>
            <li>Tap &ldquo;Add to Home Screen&rdquo;.</li>
          </ol>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-amber-400">Android</h2>
          <ol className="list-decimal list-inside text-zinc-300 mt-2 text-sm space-y-1">
            <li>Open the editor in Chrome.</li>
            <li>Tap the menu (⋮) → &ldquo;Install app&rdquo; or &ldquo;Add to Home screen&rdquo;.</li>
          </ol>
        </div>
      </section>

      <section className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-semibold">Source code</h2>
        <p className="text-zinc-400 text-sm mt-2">
          ClawPDF is open source under the MIT license.
          {" "}
          <a className="text-amber-400 underline" href="https://github.com/shanto12/clawpdf" target="_blank" rel="noreferrer">
            github.com/shanto12/clawpdf
          </a>
        </p>
      </section>
    </main>
  );
}
