"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Search,
  Star,
  Utensils,
  MapPin,
  Clock3,
  Sparkles,
  Coffee,
} from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { Photo } from "../ui/Photo";
import { CountUp } from "../ui/CountUp";
import { Spotlight } from "./Spotlight";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSearch } from "@/app/providers/SearchProvider";

/** Cycled through the search placeholder so the field doesn't read as dead. */
const HINTS = ["biryani", "open now", "rooftop", "cheap and quick", "coffee"];

const QUICK_LINKS = [
  { label: "Open now", href: "/search", icon: Clock3 },
  { label: "Coffee", href: "/search?q=Caf%C3%A9s", icon: Coffee },
  { label: "Spin the wheel", href: "/#wheel", icon: Sparkles },
];

/** Positions for the desktop collage, in render order. */
const SLOTS = [
  { className: "left-0 top-4 h-52 w-44", delay: 0 },
  { className: "left-40 top-0 h-64 w-56 z-10", delay: 0.4 },
  { className: "right-0 top-24 h-44 w-40", delay: 0.8 },
  { className: "left-8 bottom-0 h-44 w-44", delay: 1.2 },
  { className: "right-2 bottom-2 h-52 w-48 z-10", delay: 1.6 },
];

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

  // Collage shows real places, photographed by name, rather than stock plates.
  const showcase = useMemo(() => {
    const ranked = [...restaurants].sort((a, b) => b.rating - a.rating);
    return ranked.slice(0, SLOTS.length);
  }, [restaurants]);

  const stats = useMemo(() => {
    const reviews = restaurants.reduce((n, r) => n + r.reviewCount, 0);
    const islands = new Set(restaurants.map((r) => r.location).filter(Boolean));
    return [
      {
        icon: Utensils,
        value: restaurants.length,
        format: (n: number) => (n ? String(n) : "—"),
        label: "Places listed",
        tint: "bg-root-100 text-root-600 dark:bg-root-500/15 dark:text-root-300",
      },
      {
        icon: Star,
        value: reviews,
        format: (n: number) =>
          n > 999 ? `${(n / 1000).toFixed(1)}k` : String(n || "—"),
        label: "Reviews",
        tint: "bg-saffron-400/25 text-saffron-500 dark:bg-saffron-500/15",
      },
      {
        icon: MapPin,
        value: islands.size,
        format: (n: number) => (n ? String(n) : "—"),
        label: "Islands",
        tint: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
      },
    ];
  }, [restaurants]);

  const firstName = user?.displayName?.split(" ")[0];

  return (
    // Fills the screen at every size. On phones that means the viewport minus
    // the navbar and the tab bar — svh rather than vh so the height doesn't
    // jump when mobile browsers hide their URL bar mid-scroll.
    <section className="relative flex min-h-[calc(100svh-6.75rem)] items-center overflow-hidden md:min-h-[calc(100svh-4.25rem)]">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 py-6 md:px-6 md:py-12 lg:grid-cols-2 lg:gap-10">
        <div className="text-center lg:text-left">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-root-200 bg-root-50 px-3.5 py-1.5 text-sm font-medium text-root-700 dark:border-root-900/40 dark:bg-root-900/20 dark:text-root-300"
          >
            <Star size={14} className="fill-saffron-500 text-saffron-500" />
            Malé &amp; Hulhumalé
          </motion.span>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 font-display text-[2rem] font-extrabold leading-[1.08] tracking-tight text-ink-900 dark:text-white sm:text-4xl md:mt-5 md:text-6xl"
          >
            {firstName ? (
              <>
                Evening, <span className="text-root-500">{firstName}</span>.
                <br />
                Hungry?
              </>
            ) : (
              <>
                Where are we
                <br />
                <span className="text-root-500">eating tonight?</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-3 max-w-lg text-base text-ink-500 md:mt-5 md:text-lg lg:mx-0"
          >
            Menus, opening hours and what people actually thought — for the
            places you can walk to. Spin the wheel if you&apos;d rather not
            think about it.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 md:mt-7"
          >
            <button
              onClick={open}
              className="mx-auto flex min-h-[52px] w-full max-w-lg items-center gap-3 rounded-2xl border border-ink-200 bg-white px-5 py-4 text-left shadow-soft transition hover:shadow-card active:scale-[0.99] dark:border-ink-700 dark:bg-ink-900 lg:mx-0"
            >
              <Search className="shrink-0 text-root-500" />
              <span className="truncate text-ink-400">
                Try{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={hint}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="inline-block text-ink-500"
                  >
                    “{hint}”
                  </motion.span>
                </AnimatePresence>
              </span>
              <kbd className="ml-auto hidden shrink-0 rounded bg-ink-100 px-2 py-1 text-xs text-ink-500 dark:bg-ink-800 sm:block">
                ⌘K
              </kbd>
            </button>
          </motion.div>

          {/* Straight into the three things people actually open the app for. */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start"
          >
            {QUICK_LINKS.map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3.5 text-[13px] font-medium text-ink-700 transition active:scale-95 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 md:hover:border-root-300 md:hover:text-root-600"
              >
                <q.icon size={14} className="text-root-500" />
                {q.label}
              </Link>
            ))}
          </motion.div>

          {/* Phone-only spotlight; desktop has the collage instead. */}
          <div className="mt-6 lg:hidden">
            <Spotlight restaurants={showcase} />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-5 sm:gap-8 md:mt-8 lg:justify-start">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <span className={`grid h-10 w-10 place-items-center rounded-2xl ${s.tint}`}>
                  <s.icon size={19} />
                </span>
                <div className="text-left">
                  <p className="text-xl font-extrabold text-ink-900 dark:text-white">
                    <CountUp value={s.value} format={s.format} />
                  </p>
                  <p className="text-xs text-ink-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating collage — desktop only; on phones it would be pure weight. */}
        <div className="relative hidden h-[440px] lg:block">
          {showcase.map((r, i) => (
            <motion.div
              key={r.id}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`absolute overflow-hidden rounded-3xl bg-ink-100 shadow-card ring-1 ring-black/5 dark:bg-ink-800 ${SLOTS[i].className}`}
              style={
                reduceMotion
                  ? undefined
                  : { animation: `float 6s ease-in-out ${SLOTS[i].delay}s infinite` }
              }
            >
              <Photo r={r} sizes="240px" priority={i === 0} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
