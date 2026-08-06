"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { refreshRestaurants, REFRESH_EVENT } from "@/app/lib/restaurants";

/** How far you have to drag before letting go actually refreshes. */
const THRESHOLD = 72;
/** Past this the indicator stops following your finger. */
const MAX_PULL = 110;

/**
 * Pull down at the top of a page to reload it, the way a native app does.
 *
 * Only on touch devices, and only when the page is genuinely scrolled to the
 * top — otherwise it would fight normal scrolling. iOS Safari already has its
 * own rubber-band refresh on some pages, so the gesture is ignored while the
 * document is over-scrolled upward by the browser itself.
 *
 * "Refresh" means dropping the cached restaurant list and re-rendering the
 * route, not a full page load: the data is what goes stale, and reloading the
 * document would throw away the bundle for no reason.
 */
export function PullToRefresh() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);

  const start = useRef<number | null>(null);
  const active = useRef(false);
  // Mirrors `pull` so the touchend handler can read it without a state updater
  // doing the deciding — an updater can run twice and would refresh twice.
  const pullRef = useRef(0);

  const setPullBoth = useCallback((value: number) => {
    pullRef.current = value;
    setPull(value);
  }, []);

  const finish = useCallback(async () => {
    setBusy(true);
    setPullBoth(THRESHOLD);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);

    // Drop the cached list, then tell every mounted hook to re-read it.
    refreshRestaurants();
    window.dispatchEvent(new Event(REFRESH_EVENT));
    router.refresh();

    // Hold the spinner briefly even if the refresh resolves instantly — a
    // control that vanishes the moment you release reads as broken.
    await new Promise((r) => setTimeout(r, 650));
    setBusy(false);
    setPullBoth(0);
  }, [router, setPullBoth]);

  useEffect(() => {
    // Pointer-coarse only: a mouse has no reason to drag the page down.
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    const onStart = (e: TouchEvent) => {
      if (busy || window.scrollY > 0) return;
      start.current = e.touches[0].clientY;
      active.current = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!active.current || start.current === null || busy) return;
      const delta = e.touches[0].clientY - start.current;

      // Scrolling up, or the page has moved: hand the gesture back.
      if (delta <= 0 || window.scrollY > 0) {
        active.current = false;
        setPullBoth(0);
        return;
      }
      // Resistance, so the indicator slows as it approaches the limit.
      setPullBoth(Math.min(MAX_PULL, delta * 0.5));
    };

    const onEnd = () => {
      if (!active.current) return;
      active.current = false;
      start.current = null;
      if (pullRef.current >= THRESHOLD) void finish();
      else setPullBoth(0);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [busy, finish, setPullBoth]);

  const ready = pull >= THRESHOLD;
  const progress = Math.min(1, pull / THRESHOLD);

  if (pull === 0 && !busy) return null;

  return (
    <div
      aria-hidden={!busy}
      role={busy ? "status" : undefined}
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center md:hidden"
      style={{ transform: `translateY(${Math.max(8, pull - 20)}px)` }}
    >
      <motion.span
        animate={{ scale: ready || busy ? 1 : 0.85 + progress * 0.15 }}
        transition={{ duration: 0.15 }}
        className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-card ring-1 ring-black/5 dark:bg-ink-800 dark:ring-white/10"
      >
        {/* A chili, to match the app's loader — it fills as you pull, then
            spins while the data reloads. */}
        <motion.svg
          viewBox="0 0 64 80"
          width="20"
          height="25"
          animate={
            busy && !reduceMotion
              ? { rotate: 360 }
              : { rotate: progress * 180 }
          }
          transition={
            busy && !reduceMotion
              ? { duration: 0.9, repeat: Infinity, ease: "linear" }
              : { duration: 0.1 }
          }
        >
          <path
            d="M32 18c0-6 4-10 9-11"
            fill="none"
            stroke="#3f8f4a"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="32" cy="20" r="5" fill="#4CAF50" />
          <path
            d="M32 22c11 0 19 9 19 21 0 16-12 30-24 30-6 0-10-3-10-7 0-4 4-6 9-7 9-2 14-9 14-18 0-8-4-13-8-15z"
            fill="#F84B3B"
            opacity={busy ? 1 : 0.35 + progress * 0.65}
          />
        </motion.svg>
      </motion.span>
    </div>
  );
}
