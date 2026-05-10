import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClawPDF — Edit PDFs in your browser",
  description:
    "Free, privacy-first PDF editor. View, annotate, sign, merge, split, OCR, and more — entirely in your browser. Nothing ever leaves your device.",
  manifest: "/manifest.webmanifest",
  applicationName: "ClawPDF",
  keywords: [
    "PDF editor",
    "PDF tools",
    "annotate PDF",
    "merge PDF",
    "split PDF",
    "sign PDF",
    "OCR",
    "privacy PDF",
  ],
  authors: [{ name: "Sprintsite LLC" }],
  openGraph: {
    title: "ClawPDF — Edit PDFs in your browser",
    description:
      "Free, privacy-first PDF editor. Nothing ever leaves your device.",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
