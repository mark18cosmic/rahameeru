"use client";

import React from "react";
import Link from "next/link";
import { cx } from "@/app/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-root-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary:
    "bg-root-500 text-white hover:bg-root-600 shadow-glow hover:shadow-[0_14px_50px_-10px_rgba(248,75,59,0.6)]",
  secondary:
    "bg-ink-900 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-900",
  outline:
    "border border-ink-200 text-ink-800 hover:border-ink-400 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-100 dark:hover:bg-ink-800",
  ghost:
    "text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...rest
}: CommonProps & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      href={href}
      className={cx(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
