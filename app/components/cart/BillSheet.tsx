"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Minus, Plus, Users, Receipt, Share2 } from "lucide-react";
import { useCart, GST_RATE, SERVICE_RATE, type BillItem } from "@/app/lib/useCart";
import { cx } from "@/app/lib/utils";

const mvr = (n: number) => `MVR ${Math.round(n).toLocaleString()}`;

/**
 * The running bill: dishes picked off menus, with what they'll come to.
 *
 * Explicitly an estimate — the rates are shown rather than folded in silently,
 * because a restaurant may charge neither, and a number presented as final that
 * turns out to be wrong at the table is worse than no number at all.
 */
export function BillSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const { items, setQty, clear, totals, people, setPeople } = useCart();

  const byRestaurant = items.reduce<Record<string, BillItem[]>>((acc, i) => {
    (acc[i.restaurantId] ??= []).push(i);
    return acc;
  }, {});

  const share = async () => {
    const lines = items.map((i) => `${i.qty}× ${i.dish} — ${mvr(i.price * i.qty)}`);
    const text = `${lines.join("\n")}\n\nTotal ${mvr(totals.total)} · ${mvr(
      totals.perHead
    )} each for ${people}`;
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
    } catch {
      /* dismissed */
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-900/60" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-label="Your bill"
            initial={reduceMotion ? false : { y: "6%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: "5%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 330, damping: 32 }}
            className="relative flex max-h-[88svh] w-full flex-col rounded-t-3xl bg-white dark:bg-ink-900 sm:max-w-lg sm:rounded-3xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-root-100 text-root-600 dark:bg-root-500/15 dark:text-root-300">
                  <Receipt size={18} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
                    Your bill
                  </h3>
                  <p className="text-xs text-ink-500">Estimated before you go</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-ink-600 active:scale-90 dark:bg-ink-800 dark:text-ink-200"
              >
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="px-5 pb-8 pt-6 text-center">
                <p className="font-semibold text-ink-700 dark:text-ink-200">
                  Nothing added yet
                </p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-ink-500">
                  Open any menu, tap a dish, and add it here to see what an
                  evening will actually cost.
                </p>
                <Link
                  href="/explore"
                  onClick={onClose}
                  className="mt-5 inline-flex min-h-[46px] items-center rounded-full bg-root-500 px-5 font-semibold text-white"
                >
                  Find somewhere
                </Link>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-5">
                  {Object.values(byRestaurant).map((group) => (
                    <div key={group[0].restaurantId} className="mb-4">
                      <Link
                        href={`/restaurant/${group[0].restaurantSlug}`}
                        onClick={onClose}
                        className="text-xs font-semibold uppercase tracking-wide text-ink-400 hover:text-root-600"
                      >
                        {group[0].restaurantName}
                      </Link>
                      <ul className="mt-1.5 divide-y divide-ink-100 dark:divide-ink-800">
                        {group.map((i) => (
                          <li key={i.dish} className="flex items-center gap-3 py-2.5">
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-ink-900 dark:text-white">
                                {i.dish}
                              </span>
                              <span className="text-xs text-ink-500">
                                {mvr(i.price)} each
                              </span>
                            </span>

                            <span className="flex shrink-0 items-center gap-1">
                              <button
                                onClick={() => setQty(i, i.qty - 1)}
                                aria-label={`One fewer ${i.dish}`}
                                className="grid h-8 w-8 place-items-center rounded-full bg-ink-100 active:scale-90 dark:bg-ink-800"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-6 text-center text-sm font-bold tabular-nums">
                                {i.qty}
                              </span>
                              <button
                                onClick={() => setQty(i, i.qty + 1)}
                                aria-label={`One more ${i.dish}`}
                                className="grid h-8 w-8 place-items-center rounded-full bg-ink-100 active:scale-90 dark:bg-ink-800"
                              >
                                <Plus size={14} />
                              </button>
                            </span>

                            <span className="w-20 shrink-0 text-right text-sm font-bold tabular-nums text-ink-900 dark:text-white">
                              {mvr(i.price * i.qty)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="shrink-0 border-t border-ink-100 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 dark:border-ink-800">
                  <dl className="space-y-1 text-sm">
                    <Row label="Dishes" value={mvr(totals.subtotal)} />
                    <Row
                      label={`Service ${Math.round(SERVICE_RATE * 100)}%`}
                      value={mvr(totals.service)}
                      muted
                    />
                    <Row
                      label={`GST ${Math.round(GST_RATE * 100)}%`}
                      value={mvr(totals.gst)}
                      muted
                    />
                    <Row label="Total" value={mvr(totals.total)} strong />
                  </dl>

                  <div className="mt-3 flex items-center gap-3 rounded-2xl bg-ink-50 p-3 dark:bg-ink-800/60">
                    <Users size={16} className="shrink-0 text-ink-500" />
                    <span className="text-sm text-ink-600 dark:text-ink-300">Splitting</span>
                    <span className="flex items-center gap-1">
                      <button
                        onClick={() => setPeople(Math.max(1, people - 1))}
                        aria-label="Fewer people"
                        className="grid h-8 w-8 place-items-center rounded-full bg-white active:scale-90 dark:bg-ink-900"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold tabular-nums">
                        {people}
                      </span>
                      <button
                        onClick={() => setPeople(people + 1)}
                        aria-label="More people"
                        className="grid h-8 w-8 place-items-center rounded-full bg-white active:scale-90 dark:bg-ink-900"
                      >
                        <Plus size={14} />
                      </button>
                    </span>
                    <span className="ml-auto text-right">
                      <span className="block text-base font-extrabold tabular-nums text-ink-900 dark:text-white">
                        {mvr(totals.perHead)}
                      </span>
                      <span className="text-xs text-ink-500">each</span>
                    </span>
                  </div>

                  <p className="mt-2 text-center text-[11px] text-ink-400">
                    An estimate from menu prices. Some places charge no service,
                    others charge more.
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={clear}
                      className="min-h-[46px] rounded-full border border-ink-200 px-4 text-sm font-semibold text-ink-600 active:scale-95 dark:border-ink-700 dark:text-ink-300"
                    >
                      Clear
                    </button>
                    <button
                      onClick={share}
                      className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full bg-root-500 font-semibold text-white active:scale-[0.98]"
                    >
                      <Share2 size={16} /> Send to the group
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cx(muted ? "text-ink-500" : "text-ink-700 dark:text-ink-200")}>
        {label}
      </dt>
      <dd
        className={cx(
          "tabular-nums",
          strong
            ? "text-lg font-extrabold text-ink-900 dark:text-white"
            : muted
              ? "text-ink-500"
              : "font-semibold text-ink-800 dark:text-ink-100"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
