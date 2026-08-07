"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Info, QrCode } from "lucide-react";
import { usePoints } from "@/app/lib/usePoints";
import { tierFor, REVIEW_POINTS, DETAIL_BONUS, FIRST_REVIEW_BONUS } from "@/app/lib/rewards";
import { cx } from "@/app/lib/utils";
import { ScanSheet } from "../scan/ScanSheet";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  const units: [number, string][] = [
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [secs, label] of units) {
    const v = Math.floor(s / secs);
    if (v >= 1) return `${v}${label} ago`;
  }
  return "just now";
}

export function RewardsCard() {
  const { points, loading } = usePoints();
  const [scanOpen, setScanOpen] = useState(false);
  const { current, next, progress } = tierFor(points.total);

  const vendors = Object.entries(points.byVendor)
    .map(([id, amount]) => ({
      id,
      amount,
      name:
        points.history.find((h) => h.restaurantId === id)?.restaurantName ?? id,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <section className="rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-saffron-400/20 text-saffron-500">
            <Trophy size={20} />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
              Points
            </h2>
            <p className="text-sm text-ink-500">Earned for reviewing</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-extrabold text-ink-900 dark:text-white">
            {loading ? "—" : points.total.toLocaleString()}
          </p>
          <span
            className={cx(
              "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
              current.chip
            )}
          >
            {current.name}
          </span>
        </div>
      </div>

      {next && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-root-500"
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-500">
            {next.at - points.total} points to {next.name}
          </p>
        </div>
      )}

      {vendors.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            By restaurant
          </p>
          <ul className="mt-2 divide-y divide-ink-100 dark:divide-ink-800">
            {vendors.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="truncate text-sm text-ink-700 dark:text-ink-200">
                  {v.name}
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-ink-900 dark:text-white">
                  {v.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-ink-200 p-4 text-center dark:border-ink-700">
          <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
            No points yet
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {REVIEW_POINTS} for a review, +{DETAIL_BONUS} if you go into detail,
            +{FIRST_REVIEW_BONUS} for being first at a place.
          </p>
          <Link
            href="/explore"
            className="mt-3 inline-block text-sm font-semibold text-root-600"
          >
            Find somewhere to review
          </Link>
        </div>
      )}

      {points.history.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Recent
          </p>
          <ul className="mt-2 space-y-1.5">
            {points.history.slice(0, 5).map((h) => (
              <li
                key={`${h.restaurantId}-${h.at}`}
                className="flex items-center gap-2 text-sm text-ink-500"
              >
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  +{h.amount}
                </span>
                <span className="truncate">{h.reason}</span>
                <span className="ml-auto shrink-0 text-xs text-ink-400">
                  {timeAgo(h.at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setScanOpen(true)}
        className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-root-500 font-semibold text-white transition hover:bg-root-600 active:scale-[0.98]"
      >
        <QrCode size={17} /> Scan a table code
      </button>

      <ScanSheet open={scanOpen} onClose={() => setScanOpen(false)} />

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-400">
        <Info size={13} className="mt-0.5 shrink-0" />
        Points are held in each restaurant&apos;s name. What they&apos;re worth
        is up to that restaurant — none are redeemable until a venue opts in, so
        treat this as a record of what you&apos;ve contributed.
      </p>
    </section>
  );
}
