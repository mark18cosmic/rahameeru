"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useFavorites } from "@/app/lib/useFavorites";
import { cx } from "@/app/lib/utils";

export function FavoriteButton({
  id,
  className,
  size = 18,
}: {
  id: string;
  className?: string;
  size?: number;
}) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(id);
  const [burst, setBurst] = useState(false);
  const reduceMotion = useReducedMotion();
  return (
    <button
      type="button"
      onClick={(e) => {
        // The button usually sits inside a card link.
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
        setBurst(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(active ? 10 : [12, 30, 12]);
        }
      }}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      className={cx(
        "relative grid place-items-center rounded-full backdrop-blur transition active:scale-90",
        active
          ? "bg-root-500 text-white"
          : "bg-white/80 text-ink-600 hover:bg-white dark:bg-ink-800/80 dark:text-ink-200",
        className
      )}
    >
      {/* Ring that pulses outward when a place is saved. */}
      <AnimatePresence>
        {burst && active && (
          <motion.span
            key="burst"
            initial={{ scale: 0.6, opacity: 0.55 }}
            animate={{ scale: 1.9, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onAnimationComplete={() => setBurst(false)}
            className="pointer-events-none absolute inset-0 rounded-full bg-root-500"
          />
        )}
      </AnimatePresence>
      <motion.span
        key={active ? "on" : "off"}
        initial={reduceMotion ? false : { scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="relative grid place-items-center"
      >
        <Heart size={size} className={active ? "fill-white" : ""} />
      </motion.span>
    </button>
  );
}
