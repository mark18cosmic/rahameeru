"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Trophy } from "lucide-react";

/**
 * The payoff for writing a review: a card that flies in with the breakdown of
 * what was earned, then leaves on its own. Deliberately short-lived — it's a
 * thank you, not a dialog to dismiss.
 */
export function PointsToast({
  earned,
  onDone,
}: {
  earned: { amount: number; lines: { label: string; amount: number }[] } | null;
  onDone: () => void;
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!earned) return;
    const id = setTimeout(onDone, 4200);
    return () => clearTimeout(id);
  }, [earned, onDone]);

  return (
    <AnimatePresence>
      {earned && (
        <motion.div
          role="status"
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          onClick={onDone}
          className="fixed inset-x-4 bottom-[calc(7rem+env(safe-area-inset-bottom))] z-[90] mx-auto max-w-sm cursor-pointer clay-on-color rounded-[1.75rem] bg-ink-900 p-4 text-white dark:bg-white dark:text-ink-900 md:bottom-6 md:right-6 md:left-auto md:mx-0"
        >
          <div className="flex items-center gap-3">
            <motion.span
              initial={reduceMotion ? false : { rotate: -20, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.1 }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-saffron-400/25 text-saffron-500"
            >
              <Trophy size={20} />
            </motion.span>
            <div className="min-w-0">
              <p className="font-display text-lg font-extrabold leading-tight">
                +{earned.amount} points
              </p>
              <p className="text-sm opacity-70">Thanks for the review</p>
            </div>
          </div>

          <ul className="mt-3 space-y-1 border-t border-white/15 pt-3 text-sm dark:border-ink-900/10">
            {earned.lines.map((l, i) => (
              <motion.li
                key={l.label}
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center justify-between gap-3"
              >
                <span className="opacity-75">{l.label}</span>
                <span className="font-semibold tabular-nums">+{l.amount}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
