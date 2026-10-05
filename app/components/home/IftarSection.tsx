"use client";

import Link from "next/link";
import { Moon } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { formatSpan, minutesUntil, type Ramadan } from "@/app/lib/clock";
import { Photo } from "../ui/Photo";

/**
 * Leads the home page during Ramadan. The day is organised around iftar, so
 * the first thing on the page is how long until it, and where to go for it.
 */
export function IftarSection({
  now,
  ramadan,
  restaurants,
}: {
  now: Date;
  ramadan: Ramadan;
  /** Places that list an iftar spread. */
  restaurants: Restaurant[];
}) {
  const toIftar = minutesUntil(ramadan.iftar, now);
  const toSuhoor = minutesUntil(ramadan.suhoor, now);
  // Fasting until iftar; from iftar onwards the next thing is suhoor's end.
  const fasting = toIftar < toSuhoor;

  const spreads = [...restaurants].sort(
    (a, b) => (a.iftar?.price ?? Infinity) - (b.iftar?.price ?? Infinity)
  );

  return (
    <section className="mt-10 md:mt-16">
      <div className="surface grid gap-6 rounded-3xl p-5 md:grid-cols-[0.8fr_1.2fr] md:gap-10 md:p-8">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-root-600 dark:text-root-400">
            <Moon size={15} /> Ramadan
          </p>
          <p className="mt-3 font-display text-4xl font-bold tracking-tight text-ink-900 tabular-nums dark:text-white md:text-5xl">
            {formatSpan(fasting ? toIftar : toSuhoor)}
          </p>
          <p className="mt-1 text-ink-600 dark:text-ink-300">
            {fasting
              ? `until iftar at ${ramadan.iftar}`
              : `until suhoor ends at ${ramadan.suhoor}`}
          </p>
          <p className="mt-4 text-sm text-ink-500 dark:text-ink-400">
            Times for Malé. Opening hours on Rahameeru switch to each
            place&apos;s Ramadan hours where they have listed them.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink-900 dark:text-white md:text-2xl">
            Iftar spreads
          </h2>
          {spreads.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              No restaurant has listed an iftar spread yet. Owners can add one
              from the vendor dashboard, under their listing.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-[var(--line)]">
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
