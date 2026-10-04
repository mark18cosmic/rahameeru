"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { cx } from "@/app/lib/utils";
import { RestaurantCard, CardSkeleton } from "../RestaurantCard";

/**
 * The heading every home rail shares. Type does the work: no icon tile, no
 * per-rail colour, one coral link. Six differently tinted headings read as six
 * different apps stacked on top of each other.
 */
export function RailHeader({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 md:mb-5 md:gap-4">
      <div className="min-w-0">
        <h2 className="truncate font-display text-[1.375rem] font-bold leading-tight tracking-tight text-ink-900 dark:text-white md:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 line-clamp-1 text-sm text-ink-500 md:mt-1 md:text-base dark:text-ink-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {children}
        {href && (
          <Link
            href={href}
            className="flex min-h-[44px] items-center gap-1 text-sm font-semibold text-root-600 transition-all hover:gap-1.5 hover:text-root-700 dark:text-root-400"
          >
            See all <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}

export function RestaurantRail({
  title,
  subtitle,
  restaurants,
  loading,
  href,
  toolbar,
}: {
  title: string;
  subtitle?: string;
  restaurants: Restaurant[];
  loading?: boolean;
  href?: string;
  /** Sits between the heading and the cards, e.g. the occasion tabs. */
  toolbar?: React.ReactNode;
}) {
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
    <section className="mt-10 md:mt-16">
      <RailHeader title={title} subtitle={subtitle} href={href}>
        {/* Arrows are a desktop affordance; phones just swipe. */}
        <div className="hidden gap-1.5 md:flex">
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
                  "surface grid h-9 w-9 place-items-center rounded-full",
                  disabled
                    ? "cursor-not-allowed text-ink-300 dark:text-ink-600"
                    : "press text-ink-700 dark:text-ink-200"
                )}
              >
                <Icon size={17} />
              </button>
            );
          })}
        </div>
      </RailHeader>

      {toolbar}

      {/* Cards are plain divs on purpose. Animating each one into view fires
          mid-swipe on a horizontal scroller — every card that crosses the edge
          starts a transform, which is what made the rail feel like it was
          catching. scroll-pl keeps a snapped card clear of the screen edge
          instead of flush against it. */}
      <div
        ref={scroller}
        // pt/pb are generous because surface cards throw a deep drop shadow and
        // lift on hover — `overflow-x-auto` clips both axes, so a tight
        // padding sliced the shadow off along the top and bottom edges.
        className="scrollbar-hide -mx-5 flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-pl-5 px-5 pb-7 pt-2 md:mx-0 md:scroll-pl-0 md:gap-4 md:px-0"
      >
        {loading && restaurants.length === 0
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
