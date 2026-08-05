"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { cx } from "@/app/lib/utils";
import { RestaurantCard, CardSkeleton } from "../RestaurantCard";

/**
 * Each rail carries its own accent. Six identical coral headings down the home
 * page read as one wall of text; a colour per rail gives the scroll some rhythm
 * and makes a section recognisable before you've read its title.
 */
export type Accent = "root" | "sky" | "emerald" | "violet" | "amber" | "rose";

const ACCENTS: Record<Accent, { chip: string; link: string }> = {
  root: {
    chip: "bg-root-100 text-root-600 dark:bg-root-500/15 dark:text-root-300",
    link: "text-root-600 hover:text-root-700",
  },
  sky: {
    chip: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    link: "text-sky-600 hover:text-sky-700",
  },
  emerald: {
    chip: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    link: "text-emerald-600 hover:text-emerald-700",
  },
  violet: {
    chip: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    link: "text-violet-600 hover:text-violet-700",
  },
  amber: {
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    link: "text-amber-600 hover:text-amber-700",
  },
  rose: {
    chip: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    link: "text-rose-600 hover:text-rose-700",
  },
};

export function RestaurantRail({
  title,
  subtitle,
  restaurants,
  loading,
  href,
  icon: Icon,
  accent = "root",
}: {
  title: string;
  subtitle?: string;
  restaurants: Restaurant[];
  loading?: boolean;
  href?: string;
  icon?: LucideIcon;
  accent?: Accent;
}) {
  const tone = ACCENTS[accent];
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const reduceMotion = useReducedMotion();

  /** Keeps the arrow buttons in sync with how far the rail is scrolled. */
  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync, restaurants.length]);

  const nudge = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    // Scroll by most of a viewport so a card is always left peeking.
    el.scrollBy({
      left: dir * el.clientWidth * 0.85,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  if (!loading && restaurants.length === 0) return null;

  return (
    <section className="mt-8 md:mt-12">
      <div className="mb-3 flex items-end justify-between gap-3 md:mb-4 md:gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink-900 dark:text-white md:text-3xl">
            {Icon && (
              <span
                className={cx(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-xl md:h-9 md:w-9",
                  tone.chip
                )}
              >
                <Icon size={17} />
              </span>
            )}
            <span className="truncate">{title}</span>
          </h2>
          {subtitle && (
            <p className="mt-0.5 line-clamp-1 text-sm text-ink-500 md:mt-1 md:text-base">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Arrows are a desktop affordance; phones just swipe. */}
          <div className="hidden gap-1 md:flex">
            {([-1, 1] as const).map((dir) => {
              const disabled = dir === -1 ? atStart : atEnd;
              const Icon = dir === -1 ? ChevronLeft : ChevronRight;
              return (
                <button
                  key={dir}
                  onClick={() => nudge(dir)}
                  disabled={disabled}
                  aria-label={
                    dir === -1 ? `Scroll ${title} left` : `Scroll ${title} right`
                  }
                  className={cx(
                    "grid h-9 w-9 place-items-center rounded-full border transition active:scale-90",
                    disabled
                      ? "cursor-not-allowed border-ink-100 text-ink-300 dark:border-ink-800 dark:text-ink-700"
                      : "border-ink-200 text-ink-700 hover:border-root-300 hover:bg-root-50 hover:text-root-600 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
                  )}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
          {href && (
            <Link
              href={href}
              className={cx(
                "flex shrink-0 items-center gap-1 text-sm font-semibold transition-all hover:gap-2",
                tone.link
              )}
            >
              See all <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Cards are plain divs on purpose. Animating each one into view fires
          mid-swipe on a horizontal scroller — every card that crosses the edge
          starts a transform, which is what made the rail feel like it was
          catching. scroll-pl keeps a snapped card clear of the screen edge
          instead of flush against it. */}
      <div
        ref={scroller}
        className="scrollbar-hide -mx-5 flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-pl-5 px-5 pb-2 md:mx-0 md:scroll-pl-0 md:gap-4 md:px-0"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[228px] shrink-0 snap-start md:w-[280px]">
                <CardSkeleton />
              </div>
            ))
          : restaurants.map((r) => (
              <div key={r.id} className="w-[228px] shrink-0 snap-start md:w-[280px]">
                <RestaurantCard r={r} />
              </div>
            ))}
        {/* Trailing spacer so the last card can clear the right edge. */}
        <div aria-hidden className="w-2 shrink-0 md:hidden" />
      </div>
    </section>
  );
}
