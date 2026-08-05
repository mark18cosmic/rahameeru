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
        // No `position` here on purpose. Callers pass `absolute`, and Tailwind
        // emits `.relative` after `.absolute`, so a `relative` in this base
        // silently won — the button dropped out of its corner and landed
        // wherever it fell in the flow, half under the photo. Callers own
        // position; the burst ring anchors to whatever they positioned it
        // against.
        //
        // Opaque rather than translucent: a see-through circle over a bright
        // photo read as part of the photo.
        "z-10 grid shrink-0 place-items-center rounded-full shadow-sm ring-1 transition active:scale-90",
        active
          ? "bg-root-500 text-white ring-root-600/30"
          : "bg-white text-ink-600 ring-black/5 hover:bg-white dark:bg-ink-900 dark:text-ink-100 dark:ring-white/10",
        className
      )}
    >
      {/* Ring that pulses outward when a place is saved. */}
      <AnimatePresence>
        {burst && active && (
          <motion.span
            key="burst"
            initial={{ scale: 0.6, opacity: 0.55 }}
            animate={{ scale: 1.55, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onAnimationComplete={() => setBurst(false)}
            // Stays inside the card's clip so the pulse doesn't get sliced off
            // at the photo edge.
            className="pointer-events-none absolute inset-0 rounded-full bg-root-500"
          />
        )}
      </AnimatePresence>
      <motion.span
        key={active ? "on" : "off"}
        initial={reduceMotion ? false : { scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="relative z-10 grid place-items-center"
      >
        <Heart size={size} className={active ? "fill-white" : ""} />
      </motion.span>
    </button>
  );
}
