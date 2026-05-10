import * as React from "react";

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="ClawPDF"
      className={className}
    >
      <rect x="2" y="2" width="60" height="60" rx="12" fill="#18181b" />
      <path
        d="M14 22 L24 14 L24 22 L34 22 L34 14 L44 22 L44 50 L14 50 Z"
        fill="#f59e0b"
      />
      <path d="M22 30 H 38 M22 36 H 38 M22 42 H 32" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
