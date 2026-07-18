import React from "react";
import { cx } from "@/app/lib/utils";

const inputBase =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-ink-900 placeholder-ink-400 outline-none transition focus:border-root-400 focus:ring-4 focus:ring-root-100 dark:border-ink-700 dark:bg-ink-800 dark:text-white dark:placeholder-ink-400 dark:focus:ring-root-900/30";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cx(inputBase, className)} {...props} />
));
Input.displayName = "Input";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(inputBase, "min-h-[110px] resize-y", className)} {...props} />;
}

export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200", className)}>
      {children}
    </label>
  );
}
