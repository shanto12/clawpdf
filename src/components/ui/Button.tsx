"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-amber-500 text-zinc-950 hover:bg-amber-400 active:bg-amber-600 font-semibold",
  ghost: "bg-transparent text-zinc-200 hover:bg-zinc-800",
  outline:
    "bg-transparent border border-zinc-700 text-zinc-100 hover:bg-zinc-800",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-9 w-9",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  ),
);
Button.displayName = "Button";
