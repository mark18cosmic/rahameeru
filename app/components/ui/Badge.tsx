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
    neutral: "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200",
    brand: "bg-root-100 text-root-700 dark:bg-root-900/40 dark:text-root-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    outline: "border border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300",
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
