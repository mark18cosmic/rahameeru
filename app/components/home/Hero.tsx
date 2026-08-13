"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Search,
  Star,
  Utensils,
  MapPin,
  Clock3,
  Sparkles,
  Coffee,
} from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { photoUrl } from "@/app/lib/utils";
import { CountUp } from "../ui/CountUp";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSearch } from "@/app/providers/SearchProvider";
import {
  ThreeDMarquee,
  type MarqueeImage,
} from "../lightswind/3d-marquee";

/** Cycled through the search placeholder so the field doesn't read as dead. */
const HINTS = ["biryani", "open now", "rooftop", "cheap and quick", "coffee"];

const QUICK_LINKS = [
  { label: "Open now", href: "/search", icon: Clock3 },
  { label: "Coffee", href: "/search?q=Caf%C3%A9s", icon: Coffee },
  { label: "Spin the wheel", href: "/#wheel", icon: Sparkles },
];

/**
 * Enough tiles to fill the tilted plane without repeating obviously — the
 * marquee doubles this internally, so twelve becomes twenty-four on screen.
 *
 * Kept deliberately low: no listing carries a stored photo, so every distinct
 * tile is one `/api/photo` lookup on a cold cache. Twelve is the point where
 * the plane still looks full without turning the first paint of the home page
 * into a wall of image searches.
 */
const MARQUEE_TILES = 12;

export function Hero({ restaurants = [] }: { restaurants?: Restaurant[] }) {
  const { user } = useAuth();
  const { open } = useSearch();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [hint, setHint] = useState(HINTS[0]);

  useEffect(() => {
    if (reduceMotion) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % HINTS.length;
      setHint(HINTS[i]);
    }, 2600);
    return () => clearInterval(id);
  }, [reduceMotion]);

  // The marquee shows real places, best-rated first, and each tile links to
  // that restaurant — so the backdrop is navigation, not decoration.
  const tiles = useMemo<MarqueeImage[]>(() => {
    const ranked = [...restaurants].sort((a, b) => b.rating - a.rating);
    if (!ranked.length) return [];
    return Array.from({ length: MARQUEE_TILES }, (_, i) => {
      const r = ranked[i % ranked.length];
      return {
        src: photoUrl(r, Math.floor(i / ranked.length)),
        alt: r.name,
        href: `/restaurant/${r.slug}`,
      };
    });
  }, [restaurants]);

  const stats = useMemo(() => {
    const reviews = restaurants.reduce((n, r) => n + r.reviewCount, 0);
    const islands = new Set(restaurants.map((r) => r.location).filter(Boolean));
    return [
      {
        icon: Utensils,
        value: restaurants.length,
        format: (n: number) => (n ? String(n) : "—"),
        label: "Places listed",
        tint: "clay-root",
      },
      {
        icon: Star,
        value: reviews,
        format: (n: number) =>
          n > 999 ? `${(n / 1000).toFixed(1)}k` : String(n || "—"),
        label: "Reviews",
        tint: "clay-saffron",
      },
      {
        icon: MapPin,
        value: islands.size,
        format: (n: number) => (n ? String(n) : "—"),
        label: "Islands",
        tint: "clay-sm text-root-500",
      },
    ];
  }, [restaurants]);

  const firstName = user?.displayName?.split(" ")[0];

  return (
    // Fills the screen at every size. On phones that means the viewport minus
    // the navbar and the tab bar — svh rather than vh so the height doesn't
    // jump when mobile browsers hide their URL bar mid-scroll.
    <section className="relative flex min-h-[calc(100svh-6.75rem)] items-stretch overflow-hidden md:min-h-[calc(100svh-4.25rem)] lg:items-center">
      {/* --- Tilted photo plane, behind everything ------------------------ */}
      {tiles.length > 0 && (
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <ThreeDMarquee
            images={tiles}
            cols={4}
            // Tiles are links, so the plane itself takes pointer events back.
            className="pointer-events-auto h-full max-sm:h-full rounded-none bg-transparent opacity-45 dark:bg-transparent dark:opacity-30"
            onImageClick={(image) => {
              if (image.href) router.push(image.href);
            }}
          />
          {/* Scrim. The headline sits over moving photos, so the plane is
              washed toward the page colour rather than relying on a text
              shadow to stay legible. Flat rather than a fade — the tiles are
              already dimmed, so an even wash is enough and keeps the hero
              free of gradients like the rest of the page. */}
          <div className="absolute inset-0 bg-[var(--bg)]/75" />
        </div>
      )}

      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 py-5 md:px-6 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="flex h-full flex-col text-center lg:block lg:text-left">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay-sm inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-root-700 dark:text-root-300"
          >
            <Star size={14} className="fill-saffron-500 text-saffron-500" />
            Malé &amp; Hulhumalé
          </motion.span>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 font-display text-[2rem] font-extrabold leading-[1.08] tracking-tight text-ink-900 dark:text-white sm:text-4xl md:mt-5 md:text-6xl"
          >
            {firstName ? (
              <>
                Evening, <span className="text-root-500">{firstName}</span>.
                <br />
                Hungry?
              </>
            ) : (
              <>
                Where are we
                <br />
                <span className="text-root-500">eating tonight?</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-3 max-w-lg text-base text-ink-500 dark:text-ink-300 md:mt-5 md:text-lg lg:mx-0"
          >
            Menus, opening hours and what people actually thought — for the
            places you can walk to. Spin the wheel if you&apos;d rather not
            think about it.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 shrink-0 md:mt-7"
          >
            <button
              onClick={open}
              className="clay clay-press mx-auto flex min-h-[60px] w-full max-w-lg items-center gap-3 rounded-[1.75rem] px-5 py-4 text-left lg:mx-0"
            >
              <span className="clay-root grid h-10 w-10 shrink-0 place-items-center rounded-2xl">
                <Search size={18} />
              </span>
              <span className="truncate text-ink-400">
                Try{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={hint}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="inline-block text-ink-500 dark:text-ink-300"
                  >
                    “{hint}”
                  </motion.span>
                </AnimatePresence>
              </span>
              <kbd className="clay-inset ml-auto hidden shrink-0 rounded-lg px-2 py-1 text-xs text-ink-500 dark:text-ink-300 sm:block">
                ⌘K
              </kbd>
            </button>
          </motion.div>

          {/* Straight into the three things people actually open the app for. */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 flex shrink-0 flex-wrap justify-center gap-2.5 lg:justify-start"
          >
            {QUICK_LINKS.map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className="clay-sm clay-press inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-ink-700 dark:text-ink-200"
              >
                <q.icon size={14} className="text-root-500" />
                {q.label}
              </Link>
            ))}
          </motion.div>

          <div className="mt-auto flex shrink-0 flex-wrap justify-center gap-4 pt-6 sm:gap-6 md:pt-8 lg:justify-start">
            {stats.map((s) => (
              <div
                key={s.label}
                className="clay flex items-center gap-3 rounded-[1.5rem] px-4 py-3"
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl ${s.tint}`}
                >
                  <s.icon size={19} />
                </span>
                <div className="text-left">
                  <p className="text-xl font-extrabold text-ink-900 dark:text-white">
                    <CountUp value={s.value} format={s.format} />
                  </p>
                  <p className="text-xs text-ink-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column is deliberately empty on desktop: it is the window onto
            the marquee, which the scrim keeps clear of the text. */}
        <div className="hidden lg:block" aria-hidden />
      </div>
    </section>
  );
}
