"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegistrar() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installPromptEvent || installed) return null;

  return (
    <button
      onClick={async () => {
        installPromptEvent.prompt();
        await installPromptEvent.userChoice.catch(() => undefined);
        setInstallPromptEvent(null);
      }}
      className="fixed bottom-4 right-4 z-50 bg-amber-500 text-zinc-950 font-semibold rounded-full px-4 py-2 shadow-lg hover:bg-amber-400 text-sm"
      aria-label="Install ClawPDF"
    >
      Install ClawPDF
    </button>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: string }>;
}
