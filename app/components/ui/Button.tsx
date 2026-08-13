"use client";

import React from "react";
import Link from "next/link";
import { cx } from "@/app/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

// Clay presses rather than scales — `clay-press` handles the transform, so the
// old `active:scale` would fight it.
const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-root-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "clay-root clay-press",
  secondary:
    "clay-press bg-gradient-to-br from-ink-700 to-ink-900 text-white shadow-[0_18px_34px_-14px_rgba(23,21,18,0.6),inset_0_8px_14px_-6px_rgba(255,255,255,0.25),inset_-5px_-7px_14px_-6px_rgba(0,0,0,0.5)] dark:from-white dark:to-ink-100 dark:text-ink-900",
  outline: "clay-sm clay-press text-ink-800 dark:text-ink-100",
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
