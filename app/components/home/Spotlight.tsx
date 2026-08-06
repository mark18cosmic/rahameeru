"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MapPin, Star, ArrowRight } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { priceString, isOpenNow, cx } from "@/app/lib/utils";
import { Photo } from "../ui/Photo";

const INTERVAL = 4500;

/**
 * A single place, swapped every few seconds.
 *
 * Phones don't get the desktop collage, which left the hero as a headline and
 * a search box on empty space. This gives the fold something alive and
 * tappable, and it doubles as a preview of what the app actually holds.
 * Swiping or tapping a dot takes over from the timer.
 */
export function Spotlight({
  restaurants,
  className = "",
}: {
  restaurants: Restaurant[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const picks = restaurants.slice(0, 5);

  useEffect(() => {
    if (paused || reduceMotion || picks.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % picks.length), INTERVAL);
    return () => clearInterval(id);
  }, [paused, reduceMotion, picks.length]);

  if (picks.length === 0) return null;
  const r = picks[index % picks.length];
  const open = isOpenNow(r.hours);

  return (
    <div className={cx("w-full", className)}>
      {/* Fills whatever height the hero has spare, with a floor so it stays a
          photo rather than a strip on a short screen. */}
      <div className="relative min-h-[168px] flex-1 overflow-hidden rounded-3xl bg-ink-100 dark:bg-ink-800">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={r.id}
            initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            drag={picks.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragStart={() => setPaused(true)}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40) setIndex((i) => (i + 1) % picks.length);
              else if (info.offset.x > 40)
                setIndex((i) => (i - 1 + picks.length) % picks.length);
              setPaused(false);
            }}
            className="absolute inset-0"
          >
            <Link href={`/restaurant/${r.slug}`} className="block h-full w-full">
              <Photo r={r} sizes="(max-width: 768px) 100vw, 420px" priority />
              <div className="absolute inset-0 bg-ink-900/45" />

              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/95 px-2 py-1 text-[11px] font-bold text-ink-900">
                    Tonight&apos;s pick
                  </span>
                  {open && (
                    <span className="rounded-full bg-emerald-500 px-2 py-1 text-[11px] font-bold text-white">
                      Open
                    </span>
                  )}
                </div>
                <h3 className="mt-2 truncate font-display text-xl font-extrabold text-white">
                  {r.name}
                </h3>
                <div className="mt-0.5 flex items-center gap-2 text-[13px] text-white/85">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="fill-saffron-400 text-saffron-400" />
                    {r.rating.toFixed(1)}
                  </span>
                  <span className="flex min-w-0 items-center gap-1">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{r.location}</span>
                  </span>
                  <span>{priceString(r.priceLevel)}</span>
                  <ArrowRight size={14} className="ml-auto shrink-0" />
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {picks.length > 1 && (
        <div className="mt-2.5 flex shrink-0 justify-center gap-1.5">
          {picks.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                setIndex(i);
                setPaused(true);
              }}
              aria-label={`Show ${p.name}`}
              aria-current={i === index}
              className="grid h-6 w-6 place-items-center"
            >
              <span
                className={cx(
                  "block h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-5 bg-root-500" : "w-1.5 bg-ink-300 dark:bg-ink-700"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
