import React from "react";
import { cx } from "@/app/lib/utils";

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "brand" | "success" | "outline";
}) {
  const tones = {
    neutral: "clay-sm text-ink-700 dark:text-ink-200",
    brand: "clay-root",
    success:
      "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-[0_10px_20px_-10px_rgba(16,185,129,0.6),inset_0_5px_9px_-4px_rgba(255,255,255,0.55),inset_-3px_-4px_9px_-4px_rgba(6,95,70,0.45)]",
    outline: "clay-inset text-ink-600 dark:text-ink-300",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
