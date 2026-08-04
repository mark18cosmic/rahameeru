"use client";

import { motion, useReducedMotion } from "framer-motion";

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
        <motion.svg
          viewBox="0 0 64 80"
          width={size}
          height={size * 1.25}
          className="absolute inset-0"
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -8, 0], rotate: [-6, 6, -6] }
          }
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Stalk */}
          <path
            d="M32 18c0-6 4-10 9-11"
            fill="none"
            stroke="#3f8f4a"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="32" cy="20" r="5" fill="#4CAF50" />
          {/* Body */}
          <path
            d="M32 22c11 0 19 9 19 21 0 16-12 30-24 30-6 0-10-3-10-7 0-4 4-6 9-7 9-2 14-9 14-18 0-8-4-13-8-15z"
            fill="url(#chili)"
          />
          {/* Highlight */}
          <path
            d="M36 30c4 3 6 8 6 13"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="chili" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FF7D71" />
              <stop offset="0.55" stopColor="#F84B3B" />
              <stop offset="1" stopColor="#C12314" />
            </linearGradient>
          </defs>
        </motion.svg>

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
