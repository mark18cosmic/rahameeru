"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChiliMark } from "./ChiliMark";

/**
 * The app's loading state: a chili bouncing under three curls of steam.
 *
 * Drawn inline rather than pulled from an image so it inherits the brand colour
 * in both themes and stays sharp at any size, and so it costs no extra request
 * on the one screen where the network is already the bottleneck.
 */
export function ChiliLoader({
  label = "Finding the good stuff…",
  size = 72,
  className = "",
}: {
  label?: string | null;
  size?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative" style={{ width: size, height: size * 1.25 }}>
        {/* Steam */}
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute top-0 h-3 w-1.5 rounded-full bg-root-300/70 dark:bg-root-400/50"
            style={{ left: `${28 + i * 18}%` }}
            initial={false}
            animate={
              reduceMotion
                ? { opacity: 0.5 }
                : { y: [-2, -14], opacity: [0, 0.8, 0], scaleY: [0.6, 1.4] }
            }
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.28,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Chili */}
        <motion.div
          className="absolute inset-0 grid place-items-center text-root-500"
          animate={
            reduceMotion ? undefined : { y: [0, -8, 0], rotate: [-6, 6, -6] }
          }
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChiliMark size={size * 0.72} fill={0.16} />
        </motion.div>

        {/* Shadow the chili bounces on, so it reads as weight rather than drift */}
        <motion.span
          aria-hidden
          className="absolute bottom-0 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-ink-900/15 blur-[2px] dark:bg-black/40"
          animate={reduceMotion ? undefined : { scaleX: [1, 0.7, 1], opacity: [0.5, 0.25, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {label && (
        <p className="text-sm font-medium text-ink-500 dark:text-ink-400">{label}</p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
}
