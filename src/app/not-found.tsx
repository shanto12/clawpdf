import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <Logo size={64} />
      <h1 className="mt-6 text-5xl font-bold">404</h1>
      <p className="mt-2 text-zinc-400">That page doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 text-amber-400 underline">Back to home</Link>
    </main>
  );
}
