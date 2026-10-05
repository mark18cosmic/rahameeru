import React from "react";
import { cx } from "@/app/lib/utils";

// Inputs are wells: a recessed fill, so a field never reads as a card.
const inputBase =
  "well w-full rounded-2xl px-4 py-3 text-ink-900 placeholder-ink-400 outline-none transition focus:ring-4 focus:ring-root-200 dark:text-white dark:placeholder-ink-400 dark:focus:ring-root-900/40";

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
  htmlFor,
}: {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cx("mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200", className)}
    >
      {children}
    </label>
  );
}
