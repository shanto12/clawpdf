import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Privacy() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto prose prose-invert">
      <Link href="/" className="flex items-center gap-2 font-bold mb-8 not-prose"><Logo /><span>ClawPDF</span></Link>
      <h1>Privacy</h1>
      <p className="text-zinc-300">ClawPDF is a static web app. We don&apos;t run a server. We don&apos;t have a database. We can&apos;t see your PDFs because there&apos;s nowhere for them to go.</p>
      <h2 className="text-xl font-semibold mt-6 text-amber-400">What we collect</h2>
      <p className="text-zinc-300">Nothing. The site is hosted as static files on Netlify. There is no analytics script, no telemetry, no error reporting.</p>
      <h2 className="text-xl font-semibold mt-6 text-amber-400">Where files go</h2>
      <p className="text-zinc-300">Files you open are read into your browser&apos;s memory. They are never uploaded. When you click Download, the result is generated locally and offered to your browser as a save dialog.</p>
      <h2 className="text-xl font-semibold mt-6 text-amber-400">Third parties</h2>
      <p className="text-zinc-300">The PDF.js worker is loaded from unpkg.com. The OCR engine (Tesseract.js) downloads its language pack from its CDN on first use. Both requests carry only standard headers.</p>
      <p className="text-zinc-500 text-sm mt-10">© Sprintsite LLC.</p>
    </main>
  );
}
