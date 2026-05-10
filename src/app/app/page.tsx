"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center text-zinc-400">
      Loading editor…
    </div>
  ),
});

export default function AppPage() {
  return <Editor />;
}
