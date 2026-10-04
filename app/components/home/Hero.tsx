"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, Star, Clock3, Sparkles, Coffee } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSearch } from "@/app/providers/SearchProvider";
import { Photo } from "../ui/Photo";

/** Cycled through the search placeholder so the field doesn't read as dead. */
const HINTS = ["biryani", "open now", "rooftop", "cheap and quick", "coffee"];

const QUICK_LINKS = [
  { label: "Open now", href: "/search", icon: Clock3 },
  { label: "Coffee", href: "/search?q=Caf%C3%A9s", icon: Coffee },
  { label: "Spin the wheel", href: "/#wheel", icon: Sparkles },
];

/**
 * The home page's opening. Sized to its content rather than the viewport: on a
 * phone the first rail should already be peeking above the tab bar, because
 * the places are the point and the hero is only the way in.
 */
export function Hero({ restaurants = [] }: { restaurants?: Restaurant[] }) {
  const { user } = useAuth();
  const { open } = useSearch();
  const reduceMotion = useReducedMotion();
  const [hint, setHint] = useState(HINTS[0]);

  useEffect(() => {
    if (reduceMotion) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % HINTS.length;
      setHint(HINTS[i]);
    }, 2600);
    return () => clearInterval(id);
  }, [reduceMotion]);

  // The three best-rated places, shown as the desktop mosaic. Real listings
  // that link through, so the picture is also the first thing you can tap.
  const top = useMemo(
    () => [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 3),
    [restaurants]
  );

  // One quiet line of proof instead of a row of stat cards.
  const facts = useMemo(() => {
    if (!restaurants.length) return null;
    const reviews = restaurants.reduce((n, r) => n + r.reviewCount, 0);
    const islands = new Set(restaurants.map((r) => r.location).filter(Boolean));
    const fmt = (n: number) => (n > 999 ? `${(n / 1000).toFixed(1)}k` : String(n));
    return [
      `${restaurants.length} places`,
      `${fmt(reviews)} reviews`,
      `${islands.size} ${islands.size === 1 ? "island" : "islands"}`,
    ];
  }, [restaurants]);

  const firstName = user?.displayName?.split(" ")[0];

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-6 pt-6 md:px-6 md:pb-10 md:pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pt-16">
      <div>
        <motion.p
          {...rise(0)}
          className="flex items-center gap-2 text-sm font-semibold text-root-600 dark:text-root-400"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-root-500" />
          Malé &amp; Hulhumalé
        </motion.p>

        <motion.h1
          {...rise(0.04)}
          className="mt-3 text-balance font-display text-[2.125rem] font-bold leading-[1.05] tracking-tight text-ink-900 dark:text-white md:text-6xl"
        >
          {firstName ? (
            <>
              Evening, {firstName}.{" "}
              <span className="text-root-500">Hungry?</span>
            </>
          ) : (
            <>
              Where are we <span className="text-root-500">eating tonight?</span>
            </>
          )}
        </motion.h1>

        <motion.p
          {...rise(0.08)}
          className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-500 dark:text-ink-300 md:mt-5 md:text-lg"
        >
          Menus, opening hours and what people actually thought, for the places
          you can walk to.
        </motion.p>

        <motion.div {...rise(0.12)} className="mt-5 md:mt-7">
          <button
            onClick={open}
            className="surface press flex min-h-[56px] w-full max-w-lg items-center gap-3 rounded-full py-2 pl-5 pr-2 text-left"
          >
            <Search size={18} className="shrink-0 text-ink-400" />
            <span className="min-w-0 flex-1 truncate text-ink-400">
              Try{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={hint}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="inline-block text-ink-600 dark:text-ink-200"
                >
                  “{hint}”
                </motion.span>
              </AnimatePresence>
            </span>
            <kbd className="well hidden shrink-0 rounded-lg px-2 py-1 text-xs text-ink-500 dark:text-ink-300 sm:block">
              ⌘K
            </kbd>
            <span className="fill-root grid h-10 w-10 shrink-0 place-items-center rounded-full sm:hidden">
              <Search size={17} />
            </span>
          </button>
        </motion.div>

        {/* Straight into the three things people actually open the app for. */}
        <motion.div
          {...rise(0.16)}
          className="scrollbar-hide -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0"
        >
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="surface press inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-ink-700 dark:text-ink-200"
            >
              <q.icon size={14} className="text-root-500" />
              {q.label}
            </Link>
          ))}
        </motion.div>

        {facts && (
          <motion.p
            {...rise(0.2)}
            className="mt-5 text-[13px] text-ink-400 md:mt-8 md:text-sm"
          >
            {facts.join("  ·  ")}
          </motion.p>
        )}
      </div>

      {/* Desktop only: the three best-rated places, one large and two small. */}
      {top.length === 3 && (
        <motion.div
          {...rise(0.1)}
          className="hidden h-[460px] grid-cols-[1.25fr_1fr] grid-rows-2 gap-3 lg:grid"
        >
          {top.map((r, i) => (
            <Link
              key={r.id}
              href={`/restaurant/${r.slug}`}
              className={`group relative overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800 ${
                i === 0 ? "row-span-2" : ""
              }`}
            >
              <Photo
                r={r}
                priority
                sizes="(min-width: 1024px) 360px, 0px"
                className="duration-700 group-hover:scale-[1.03]"
              />
              <span className="surface absolute bottom-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-900 dark:text-white">
                <span className="truncate">{r.name}</span>
                <Star size={11} className="shrink-0 fill-saffron-500 text-saffron-500" />
                {r.rating.toFixed(1)}
              </span>
            </Link>
          ))}
        </motion.div>
      )}
    </section>
  );
}
