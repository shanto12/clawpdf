import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Terms() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <Link href="/" className="flex items-center gap-2 font-bold mb-8"><Logo /><span>ClawPDF</span></Link>
      <h1 className="text-4xl font-bold">Terms</h1>
      <div className="text-zinc-300 mt-6 space-y-4 text-sm">
        <p>ClawPDF is provided AS IS, without warranty of any kind. The software is licensed under the MIT License. You can read the full license in the GitHub repository.</p>
        <p>You are responsible for the PDFs you process and the local files you save. ClawPDF is a tool — what you do with it is up to you.</p>
        <p>Sprintsite LLC is not liable for any data loss, file corruption, or other damage arising from the use of ClawPDF. Always keep backups of important documents.</p>
      </div>
      <p className="text-zinc-500 text-xs mt-10">© Sprintsite LLC.</p>
    </main>
  );
}
