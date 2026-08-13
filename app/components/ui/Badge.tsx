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
    success: "clay-on-color bg-emerald-500 text-white",
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
