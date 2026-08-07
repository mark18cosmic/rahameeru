"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Star,
  Camera,
  QrCode,
  Trophy,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { REVIEW_POINTS, DETAIL_BONUS, FIRST_REVIEW_BONUS } from "@/app/lib/rewards";
import { SCAN_POINTS } from "@/app/lib/scan";
import { cx } from "@/app/lib/utils";

/**
 * The pitch for writing reviews, on the home page.
 *
 * Reviews are the thing the app most needs and the thing nobody does unasked,
 * so this shows the payoff rather than describing it: a review card assembles
 * itself — stars fill, dish chips drop in, the points tick up — which is
 * exactly what happens when someone actually writes one. The loop restarts so
 * a scroll-past still catches part of it.
 */

const STEPS = [
  { label: "Rate it", points: REVIEW_POINTS, icon: Star },
  { label: "Go into detail", points: DETAIL_BONUS, icon: BadgeCheck },
  { label: "Add a photo", points: 0, icon: Camera },
  { label: "First one here", points: FIRST_REVIEW_BONUS, icon: Trophy },
];

const DISHES = ["Reef fish", "Mas huni", "Garlic naan"];

export function ReviewInvite({ restaurants = [] }: { restaurants?: Restaurant[] }) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(reduceMotion ? STEPS.length : 0);

  // Somewhere real to send people, rather than a dead "learn more".
  const suggestion = restaurants[Math.floor(Math.random() * Math.max(1, restaurants.length))];

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(
      () => setStep((s) => (s >= STEPS.length + 2 ? 0 : s + 1)),
      1100
    );
    return () => clearInterval(id);
  }, [reduceMotion]);

  const shown = Math.min(step, STEPS.length);
  const total = STEPS.slice(0, shown).reduce((n, s) => n + s.points, 0);

  return (
    <section className="mt-8 md:mt-12">
      <div className="grid items-center gap-6 overflow-hidden rounded-[1.75rem] border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-ink-900 sm:rounded-[2rem] md:grid-cols-2 md:gap-10 md:p-10">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-root-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-root-600 dark:bg-root-900/25 dark:text-root-300">
            <Star size={13} className="fill-root-500 text-root-500" /> Worth writing
          </span>

          <h2 className="mt-3 font-display text-xl font-extrabold leading-tight text-ink-900 dark:text-white sm:text-2xl md:text-3xl">
            The next person deciding is you, last week.
          </h2>
          <p className="mt-2 max-w-md text-sm text-ink-500 md:text-base">
            Rate the dishes you actually ordered, add a photo, say what it came
            to. It takes a minute, it earns points at that restaurant, and
            it&apos;s the difference between a listing and a recommendation.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={suggestion ? `/restaurant/${suggestion.slug}?review=1` : "/explore"}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-root-500 px-5 font-semibold text-white transition hover:bg-root-600 active:scale-[0.98]"
            >
              Write one now <ArrowRight size={16} />
            </Link>
            <span className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-ink-200 px-4 text-sm text-ink-600 dark:border-ink-700 dark:text-ink-300">
              <QrCode size={15} className="text-root-500" />
              +{SCAN_POINTS} more if you scan at the table
            </span>
          </div>
        </div>

        {/* The review assembling itself */}
        <div className="relative">
          <div className="rounded-3xl border border-ink-100 bg-ink-50 p-4 dark:border-ink-800 dark:bg-ink-800/40">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-root-100 font-bold text-root-600 dark:bg-root-900/40 dark:text-root-300">
                A
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900 dark:text-white">
                  Aishath
                  <AnimatePresence>
                    {shown >= 2 && (
                      <motion.span
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      >
                        <BadgeCheck size={10} /> Verified visit
                      </motion.span>
                    )}
                  </AnimatePresence>
                </p>
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.span
                      key={i}
                      initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
                      animate={
                        shown >= 1
                          ? { scale: 1, opacity: 1 }
                          : { scale: 0.4, opacity: 0.25 }
                      }
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 18 }}
                    >
                      <Star
                        size={13}
                        className={cx(
                          i <= 4
                            ? "fill-saffron-500 text-saffron-500"
                            : "fill-ink-200 text-ink-200 dark:fill-ink-700 dark:text-ink-700"
                        )}
                      />
                    </motion.span>
                  ))}
                </span>
              </div>
            </div>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: shown >= 2 ? 1 : 0.25 }}
              className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300"
            >
              Came at eight on a Friday and still got a table. The reef fish is
              the thing to order.
            </motion.p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {DISHES.map((d, i) => (
                <motion.span
                  key={d}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={
                    shown >= 2 ? { opacity: 1, y: 0 } : { opacity: 0.2, y: 0 }
                  }
                  transition={{ delay: 0.1 + i * 0.09 }}
                  className="rounded-full bg-white px-2.5 py-1 text-[11px] text-ink-700 dark:bg-ink-900 dark:text-ink-200"
                >
                  {d} <b className="text-saffron-500">{5 - i}/5</b>
                </motion.span>
              ))}
            </div>

            <div className="mt-3 flex gap-1.5">
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                  animate={
                    shown >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0.15, scale: 0.98 }
                  }
                  transition={{ delay: i * 0.1 }}
                  className="grid h-14 flex-1 place-items-center rounded-xl bg-white text-ink-300 dark:bg-ink-900 dark:text-ink-700"
                >
                  <Camera size={16} />
                </motion.span>
              ))}
            </div>
          </div>

          {/* Points ticking up as the review fills out */}
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-ink-900 px-4 py-3 text-white dark:bg-white dark:text-ink-900">
            <span className="flex min-w-0 items-center gap-2 text-sm">
              <Trophy size={15} className="shrink-0 text-saffron-500" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={shown}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="truncate opacity-80"
                >
                  {shown === 0 ? "Start a review" : STEPS[Math.max(0, shown - 1)].label}
                </motion.span>
              </AnimatePresence>
            </span>
            <motion.span
              key={total}
              initial={reduceMotion ? false : { scale: 1.25 }}
              animate={{ scale: 1 }}
              className="shrink-0 font-display text-xl font-extrabold tabular-nums"
            >
              +{total}
            </motion.span>
          </div>
        </div>
      </div>
    </section>
  );
}
