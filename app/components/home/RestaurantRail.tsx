"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { cx } from "@/app/lib/utils";
import { RestaurantCard, CardSkeleton } from "../RestaurantCard";

export function RestaurantRail({
  title,
  subtitle,
  restaurants,
  loading,
  href,
}: {
  title: string;
  subtitle?: string;
  restaurants: Restaurant[];
  loading?: boolean;
  href?: string;
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
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white md:text-3xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-ink-500">{subtitle}</p>}
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
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-root-600 transition-all hover:gap-2"
            >
              See all <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      <div
        ref={scroller}
        className="scrollbar-hide -mx-4 flex snap-x gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 md:mx-0 md:px-0"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[240px] shrink-0 snap-start md:w-[280px]">
                <CardSkeleton />
              </div>
            ))
          : restaurants.map((r, i) => (
              <motion.div
                key={r.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                // Stagger only the first screenful; later cards would otherwise
                // sit waiting on a delay nobody is around to see.
                transition={{ duration: 0.35, delay: Math.min(i, 4) * 0.05 }}
                className="w-[240px] shrink-0 snap-start md:w-[280px]"
              >
                <RestaurantCard r={r} />
              </motion.div>
            ))}
      </div>
    </section>
  );
}
