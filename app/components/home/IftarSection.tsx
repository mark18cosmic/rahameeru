"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Moon } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { maldivesNow, ramadanDay, toMinutes, type Ramadan } from "@/app/lib/clock";
import { Photo } from "../ui/Photo";

/* ------------------------------------------------------------- timing */

const DAY = 24 * 60 * 60;

/** Seconds from `now` until a "HH:MM" time, wrapping past midnight. */
function secondsUntil(hhmm: string, now: Date) {
  const nowS = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const diff = toMinutes(hhmm) * 60 - nowS;
  return diff >= 0 ? diff : diff + DAY;
}

/** "2:14:09", ticking. */
function clock(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** The section's own one-second clock: a countdown that only moves every
 *  half minute doesn't feel like a countdown. */
function useSecondClock() {
  const [now, setNow] = useState(() => maldivesNow());
  useEffect(() => {
    const id = setInterval(() => setNow(maldivesNow()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Where the day stands: fasting (sun up) or the night after iftar. */
function phase(now: Date, ramadan: Ramadan) {
  const toIftar = secondsUntil(ramadan.iftar, now);
  const toSuhoor = secondsUntil(ramadan.suhoor, now);
  const fastLen = ((toMinutes(ramadan.iftar) - toMinutes(ramadan.suhoor) + 1440) % 1440) * 60;
  if (toIftar < toSuhoor) {
    return { fasting: true, left: toIftar, progress: 1 - toIftar / fastLen, sinceIftar: Infinity };
  }
  const nightLen = DAY - fastLen;
  return {
    fasting: false,
    left: toSuhoor,
    progress: 1 - toSuhoor / nightLen,
    sinceIftar: nightLen - toSuhoor,
  };
}

/* ------------------------------------------------------------- strip */

/** A greeting across the top of the home page while Ramadan mode is on. */
export function RamadanStrip({ now, ramadan }: { now: Date; ramadan: Ramadan }) {
  const day = ramadanDay(now, ramadan);
  return (
    <div className="mx-auto max-w-7xl px-5 pt-3 md:px-6">
      <p className="flex items-center gap-2 rounded-xl bg-root-50 px-4 py-2.5 text-sm text-ink-800 dark:bg-root-500/10 dark:text-ink-100">
        <Moon size={15} className="shrink-0 fill-root-500 text-root-500" />
        <span>
          <b className="font-semibold">Ramazan Mubarak</b>
          {day ? `, day ${day}.` : "."} Iftar at {ramadan.iftar} in Malé.
        </span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- section */

/**
 * Leads the home page during Ramadan. The day is organised around iftar, so
 * the first thing on the page is how long until it, and where to go for it.
 */
export function IftarSection({
  ramadan,
  restaurants,
}: {
  ramadan: Ramadan;
  /** Places that list an iftar spread. */
  restaurants: Restaurant[];
}) {
  const now = useSecondClock();
  const p = phase(now, ramadan);
  // The half hour after sunset is the moment itself, not a countdown to dawn.
  const breakingFast = !p.fasting && p.sinceIftar < 30 * 60;

  const spreads = [...restaurants].sort(
    (a, b) => (a.iftar?.price ?? Infinity) - (b.iftar?.price ?? Infinity)
  );

  return (
    <section className="mt-10 md:mt-16">
      <div className="surface grid gap-8 overflow-hidden rounded-3xl p-5 md:grid-cols-[1fr_1.1fr] md:gap-10 md:p-8">
        <div className="relative">
          <SkyArc progress={p.progress} night={!p.fasting} ramadan={ramadan} />

          <div className="mt-4 text-center">
            {breakingFast ? (
              <>
                <p className="font-display text-3xl font-bold tracking-tight text-root-600 dark:text-root-400 md:text-4xl">
                  It&apos;s iftar.
                </p>
                <p className="mt-1 text-ink-600 dark:text-ink-300">Enjoy your meal. Ramazan Mubarak.</p>
              </>
            ) : (
              <>
                <p
                  className="font-display text-4xl font-bold tracking-tight text-ink-900 tabular-nums dark:text-white md:text-5xl"
                  aria-live="off"
                >
                  {clock(p.left)}
                </p>
                <p className="mt-1 text-ink-600 dark:text-ink-300">
                  {p.fasting
                    ? `until iftar at ${ramadan.iftar}`
                    : `until suhoor ends at ${ramadan.suhoor}`}
                </p>
              </>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink-900 dark:text-white md:text-2xl">
            Iftar spreads
          </h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Times for Malé. Opening hours switch to each place&apos;s Ramadan
            hours where they have listed them.
          </p>
          {spreads.length === 0 ? (
            <p className="well mt-4 rounded-2xl p-4 text-sm text-ink-500 dark:text-ink-400">
              No restaurant has listed an iftar spread yet. Owners can add one
              from the vendor dashboard, under their listing.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--line)]">
              {spreads.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <Link href={`/restaurant/${r.slug}`} className="group flex items-center gap-3 py-3">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                      <Photo r={r} sizes="48px" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink-900 transition-colors group-hover:text-root-600 dark:text-white">
                        {r.name}
                      </span>
                      {r.iftar?.note && (
                        <span className="block truncate text-[13px] text-ink-500 dark:text-ink-400">
                          {r.iftar.note}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-ink-900 dark:text-white">
                      {r.iftar?.price ? `MVR ${r.iftar.price.toLocaleString()}` : "Ask"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- the sky */

/** Fixed star positions, so the sky doesn't reshuffle on every render. */
const STARS = [
  [38, 40, 1.6], [70, 18, 1.2], [112, 52, 1.4], [150, 14, 1.8], [196, 44, 1.2],
  [236, 20, 1.5], [278, 46, 1.3], [300, 92, 1.1], [16, 98, 1.2], [92, 92, 1],
];

/**
 * The fast as a journey across the sky. By day the sun travels from suhoor
 * (left) to iftar (right); after sunset a crescent crosses back towards dawn
 * under twinkling stars. The travelled part of the arc is drawn in coral.
 */
function SkyArc({ progress, night, ramadan }: { progress: number; night: boolean; ramadan: Ramadan }) {
  const reduce = useReducedMotion();
  const t = Math.min(1, Math.max(0, progress));
  const angle = Math.PI - t * Math.PI;
  const x = 160 + 130 * Math.cos(angle);
  const y = 150 - 130 * Math.sin(angle);
  const arc = "M30 150 A130 130 0 0 1 290 150";

  return (
    <div className="relative">
      <svg viewBox="0 0 320 172" className="w-full" role="img" aria-label={night ? "Night, after iftar" : `The fast is ${Math.round(t * 100)} percent done`}>
        {night &&
          STARS.map(([sx, sy, r], i) => (
            <motion.circle
              key={i}
              cx={sx}
              cy={sy}
              r={r}
              className="fill-root-300 dark:fill-root-200"
              initial={false}
              animate={reduce ? { opacity: 0.7 } : { opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 2.4 + (i % 4) * 0.7, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
            />
          ))}

        <path d={arc} fill="none" className="stroke-ink-200 dark:stroke-ink-700" strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round" />
        <motion.path
          d={arc}
          fill="none"
          className="stroke-root-500"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: t }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <line x1="14" y1="150" x2="306" y2="150" className="stroke-ink-200 dark:stroke-ink-700" strokeWidth="1.5" />

        <motion.g
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, x, y }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {night ? (
            <g>
              <circle r="15" className="fill-root-500" />
              <circle r="13" cx="6" cy="-4" className="fill-[var(--surface)]" />
            </g>
          ) : (
            <g>
              {!reduce && (
                <motion.circle
                  r="22"
                  className="fill-saffron-400"
                  animate={{ opacity: [0.18, 0.35, 0.18], scale: [1, 1.12, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <circle r="13" className="fill-saffron-500" />
            </g>
          )}
        </motion.g>
      </svg>

      <div className="-mt-1 flex justify-between px-1 text-xs font-medium text-ink-500 dark:text-ink-400">
        <span>{night ? `Iftar ${ramadan.iftar}` : `Suhoor ${ramadan.suhoor}`}</span>
        <span>{night ? `Suhoor ${ramadan.suhoor}` : `Iftar ${ramadan.iftar}`}</span>
      </div>
    </div>
  );
}
