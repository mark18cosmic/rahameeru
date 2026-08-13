"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  RotateCw,
  MapPin,
  ArrowRight,
  SlidersHorizontal,
  X,
  Clock3,
  Star,
  ShieldCheck,
  Ban,
} from "lucide-react";
import type { Restaurant, PriceLevel } from "@/app/lib/types";
import { priceString, isOpenNow, cx } from "@/app/lib/utils";
import { flagsFor } from "@/app/lib/diet";
import { usePreferences } from "@/app/lib/usePreferences";
import { Photo } from "../ui/Photo";
import { Stars } from "../ui/Stars";
import { Button, ButtonLink } from "../ui/Button";

const WHEEL_COLORS = [
  "#F84B3B",
  "#F5A623",
  "#E52E1D",
  "#FF7D71",
  "#C12314",
  "#FFA8A0",
  "#A02014",
  "#FFC24B",
];

interface Props {
  restaurants: Restaurant[];
}

const PRICES: { label: string; value: PriceLevel }[] = [
  { label: "$", value: 1 },
  { label: "$$", value: 2 },
  { label: "$$$", value: 3 },
  { label: "$$$$", value: 4 },
];

const RATINGS = [
  { label: "Any rating", value: 0 },
  { label: "4.0+", value: 4 },
  { label: "4.5+", value: 4.5 },
];

/** The pointer sits at the top of the wheel; canvas angle 0 points right. */
const POINTER_ANGLE = 270;
const SPIN_MS = 4200;
/**
 * Every match goes on the wheel — capping it silently excluded places people
 * had explicitly filtered for. Labels adapt instead: they shorten as slices
 * multiply, and past LABEL_LIMIT the wheel is drawn as colour alone, with the
 * winner named on the card underneath.
 */
const LABEL_LIMIT = 22;

type Prefs = {
  areas: string[];
  prices: PriceLevel[];
  cuisines: string[];
  tags: string[];
  openNow: boolean;
  minRating: number;
  suitsDiet: boolean;
  skipSeen: boolean;
};

const EMPTY: Prefs = {
  areas: [],
  prices: [],
  cuisines: [],
  tags: [],
  openNow: false,
  minRating: 0,
  suitsDiet: false,
  skipSeen: true,
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function WheelSpinner({ restaurants }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { diet } = usePreferences();

  const [prefs, setPrefs] = useState<Prefs>(EMPTY);
  const [panelOpen, setPanelOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [size, setSize] = useState(280);

  /* ---------------------------------------------------------------- facets */

  const facets = useMemo(() => {
    const count = (values: string[]) => {
      const map = new Map<string, number>();
      for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
      return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
    };
    return {
      areas: count(restaurants.map((r) => r.location).filter(Boolean)),
      cuisines: count(restaurants.flatMap((r) => r.cuisine)).slice(0, 10),
      tags: count(restaurants.flatMap((r) => r.tags ?? [])).slice(0, 10),
    };
  }, [restaurants]);

  /* ------------------------------------------------------------------ pool */

  /**
   * Everything that matches. Unlike the old version this never quietly falls
   * back to the full list when nothing matches — being sent somewhere you
   * explicitly ruled out is worse than being told to loosen a filter.
   */
  const matches = useMemo(() => {
    return restaurants.filter((r) => {
      if (prefs.areas.length && !prefs.areas.includes(r.location)) return false;
      if (prefs.prices.length && !prefs.prices.includes(r.priceLevel)) return false;
      if (prefs.cuisines.length && !r.cuisine.some((c) => prefs.cuisines.includes(c)))
        return false;
      if (prefs.tags.length && !(r.tags ?? []).some((t) => prefs.tags.includes(t)))
        return false;
      if (prefs.openNow && !isOpenNow(r.hours)) return false;
      if (prefs.minRating && r.rating < prefs.minRating) return false;
      if (prefs.skipSeen && seen.includes(r.id)) return false;

      if (prefs.suitsDiet && diet.length > 0) {
        const items = r.menu?.flatMap((s) => s.items) ?? [];
        // No menu means no evidence either way — keep it rather than hide it.
        if (items.length && !items.some((i) => flagsFor(i, diet).length === 0)) {
          return false;
        }
      }
      return true;
    });
  }, [restaurants, prefs, seen, diet]);

  /** Everything that matched, in the order it will be drawn. */
  const pool = matches;

  const activeCount =
    prefs.areas.length +
    prefs.prices.length +
    prefs.cuisines.length +
    prefs.tags.length +
    (prefs.openNow ? 1 : 0) +
    (prefs.minRating ? 1 : 0) +
    (prefs.suitsDiet ? 1 : 0);

  /* ------------------------------------------------------------------ size */

  // Fit the wheel to the narrower of its column and the viewport height, so it
  // never overflows a small phone or a landscape one.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = (width: number) => {
      const byHeight = window.innerHeight * (window.innerWidth < 640 ? 0.34 : 0.55);
      setSize(Math.max(196, Math.min(360, Math.floor(Math.min(width, byHeight)))));
    };
    const ro = new ResizeObserver(([entry]) => fit(entry.contentRect.width));
    ro.observe(el);
    const onResize = () => fit(el.getBoundingClientRect().width);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  /* ----------------------------------------------------------------- paint */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pool.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 6;
    const slice = (2 * Math.PI) / pool.length;
    const hub = Math.max(18, size * 0.075);
    // Type and label length track how many slices there are, so a big pool
    // stays legible instead of turning into overlapping text.
    const dense = pool.length > 12;
    const fontSize = Math.max(
      8,
      Math.round(size * (dense ? 0.032 : 0.042) * (pool.length > 18 ? 0.85 : 1))
    );
    const maxChars = pool.length > 18 ? 6 : pool.length > 12 ? 9 : pool.length > 8 ? 11 : 14;
    const showLabels = pool.length <= LABEL_LIMIT;

    pool.forEach((r, i) => {
      const start = i * slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = pool.length > 18 ? 1 : 2;
      ctx.stroke();

      if (!showLabels) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      const label =
        r.name.length > maxChars ? r.name.slice(0, maxChars - 1) + "…" : r.name;
      ctx.fillText(label, radius - (dense ? 8 : 12), 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, hub, 0, 2 * Math.PI);
    ctx.fillStyle = "#171512";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [pool, size]);

  /* ------------------------------------------------------------------ spin */

  const spin = useCallback(() => {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    setWinner(null);

    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);

    const slice = 360 / pool.length;
    const winIndex = Math.floor(Math.random() * pool.length);
    const jitter = (Math.random() - 0.5) * slice * 0.7;
    const sliceCentre = (winIndex + 0.5) * slice + jitter;
    const targetMod = (((POINTER_ANGLE - sliceCentre) % 360) + 360) % 360;
    const turns = 5 + Math.floor(Math.random() * 3);
    const final = (Math.floor(rotation / 360) + turns) * 360 + targetMod;

    setRotation(final);

    window.setTimeout(
      () => {
        const win = pool[winIndex];
        setWinner(win);
        setSeen((s) => [win.id, ...s].slice(0, 8));
        setSpinning(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([20, 40, 20]);
        }
      },
      reduceMotion ? 300 : SPIN_MS
    );
  }, [spinning, pool, rotation, reduceMotion]);

  /* ------------------------------------------------------------------- UI */

  const Chip = ({
    on,
    onClick,
    children,
    disabled,
  }: {
    on: boolean;
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={cx(
        // Two surfaces to sit on: the dark wheel card and the themed sheet.
        // Explicit light/dark values rather than translucent white, which
        // disappeared against the light sheet background.
        "inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition active:scale-95 disabled:opacity-50",
        on
          ? "bg-root-500 text-white md:bg-white md:text-ink-900"
          : "bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-200 md:bg-white/10 md:text-ink-200 md:hover:bg-white/20"
      )}
    >
      {children}
    </button>
  );

  /* Preference controls, shared by the desktop panel and the mobile sheet. */
  const prefControls = (
    <div className="space-y-3">
      <Group label="Where">
        {facets.areas.map((a) => (
          <Chip
            key={a}
            on={prefs.areas.includes(a)}
            disabled={spinning}
            onClick={() => setPrefs((p) => ({ ...p, areas: toggle(p.areas, a) }))}
          >
            <MapPin size={13} /> {a}
          </Chip>
        ))}
        <Chip
          on={prefs.openNow}
          disabled={spinning}
          onClick={() => setPrefs((p) => ({ ...p, openNow: !p.openNow }))}
        >
          <Clock3 size={13} /> Open now
        </Chip>
      </Group>

      <Group label="Budget">
        {PRICES.map((pr) => (
          <Chip
            key={pr.label}
            on={prefs.prices.includes(pr.value)}
            disabled={spinning}
            onClick={() => setPrefs((p) => ({ ...p, prices: toggle(p.prices, pr.value) }))}
          >
            {pr.label}
          </Chip>
        ))}
      </Group>

      <Group label="Cuisine">
        {facets.cuisines.map((c) => (
          <Chip
            key={c}
            on={prefs.cuisines.includes(c)}
            disabled={spinning}
            onClick={() => setPrefs((p) => ({ ...p, cuisines: toggle(p.cuisines, c) }))}
          >
            {c}
          </Chip>
        ))}
      </Group>

      <Group label="Vibe">
        {facets.tags.map((t) => (
          <Chip
            key={t}
            on={prefs.tags.includes(t)}
            disabled={spinning}
            onClick={() => setPrefs((p) => ({ ...p, tags: toggle(p.tags, t) }))}
          >
            {t}
          </Chip>
        ))}
      </Group>

      <Group label="Rating">
        {RATINGS.map((r) => (
          <Chip
            key={r.label}
            on={prefs.minRating === r.value}
            disabled={spinning}
            onClick={() => setPrefs((p) => ({ ...p, minRating: r.value }))}
          >
            <Star size={13} /> {r.label}
          </Chip>
        ))}
      </Group>

      <Group label="Rules">
        <Chip
          on={prefs.skipSeen}
          disabled={spinning}
          onClick={() => setPrefs((p) => ({ ...p, skipSeen: !p.skipSeen }))}
        >
          <Ban size={13} /> Skip recent winners
        </Chip>
        {diet.length > 0 && (
          <Chip
            on={prefs.suitsDiet}
            disabled={spinning}
            onClick={() => setPrefs((p) => ({ ...p, suitsDiet: !p.suitsDiet }))}
          >
            <ShieldCheck size={13} /> Has dishes for me
          </Chip>
        )}
      </Group>

      {activeCount > 0 && (
        <button
          onClick={() => setPrefs({ ...EMPTY, skipSeen: prefs.skipSeen })}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-root-300"
        >
          <X size={14} /> Clear preferences
        </button>
      )}
    </div>
  );

  const countLine =
    matches.length === 0
      ? "Nothing matches — loosen something"
      : `${matches.length} ${matches.length === 1 ? "place" : "places"} on the wheel` +
        (matches.length > LABEL_LIMIT ? " — too many to label, spin to see" : "");

  const winnerCard = winner && (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      className="w-full rounded-2xl bg-white p-3 text-ink-900 shadow-glow"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:h-16 sm:w-16">
          <Photo r={winner} sizes="64px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-root-500">
            Tonight you&apos;re eating at
          </p>
          <h4 className="truncate font-bold">{winner.name}</h4>
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-ink-500">
            <Stars value={winner.rating} size={12} />
            <span className="flex items-center gap-0.5">
              <MapPin size={11} /> {winner.location}
            </span>
            <span>{priceString(winner.priceLevel)}</span>
          </div>
        </div>
        <ButtonLink href={`/restaurant/${winner.slug}`} size="sm" className="shrink-0">
          Go <ArrowRight size={14} />
        </ButtonLink>
      </div>
    </motion.div>
  );

  return (
    <section
      id="wheel"
      className="relative scroll-mt-24 overflow-hidden rounded-[1.75rem] bg-ink-900 p-4 text-white shadow-card sm:rounded-[2rem] sm:p-6 md:p-10"
    >
      {/* Phones get wheel, count, and two buttons — everything on one screen,
          with the preference list behind a sheet. Wide screens keep the
          two-column layout where the controls can live in the open. */}
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:items-center md:gap-8">
        <div className="order-1 min-w-0 md:order-none">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-root-300">
            <Sparkles size={14} /> Can&apos;t decide?
          </span>
          <h2 className="mt-2.5 font-display text-xl font-extrabold leading-tight sm:text-3xl md:mt-4 md:text-4xl">
            Let the wheel decide.
          </h2>
          <p className="mt-2 hidden max-w-md text-sm text-ink-300 md:block md:text-base">
            Tell it what you&apos;re in the mood for and it only spins places you
            would actually say yes to.
          </p>

          {/* Desktop-only inline controls */}
          <div className="mt-5 hidden md:block">{prefControls}</div>

          <div className="mt-4 hidden items-center gap-3 md:flex">
            <p className="text-sm text-ink-400" aria-live="polite">
              {countLine}
            </p>
            {activeCount > 0 && (
              <button
                onClick={() => setPrefs({ ...EMPTY, skipSeen: prefs.skipSeen })}
                className="text-sm font-semibold text-root-300 transition hover:text-root-200"
              >
                Clear filters
              </button>
            )}
          </div>

          <Button
            onClick={spin}
            disabled={spinning || pool.length === 0}
            size="lg"
            className="mt-3 hidden md:inline-flex"
          >
            <RotateCw size={18} className={spinning ? "animate-spin" : ""} />
            {spinning ? "Spinning…" : winner ? "Spin again" : "Spin the wheel"}
          </Button>
        </div>

        <div className="order-2 flex w-full flex-col items-center gap-3 md:order-none">
          <div
            ref={wrapRef}
            className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px]"
            style={{ height: size }}
          >
            <div className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2">
              <div className="h-0 w-0 border-x-[12px] border-t-[20px] border-x-transparent border-t-white drop-shadow" />
            </div>
            <motion.div
              animate={{ rotate: rotation }}
              transition={{
                duration: reduceMotion ? 0.3 : SPIN_MS / 1000,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ width: size, height: size }}
              className="mx-auto"
            >
              <canvas
                ref={canvasRef}
                onClick={spin}
                style={{ width: size, height: size }}
                className={cx(
                  "drop-shadow-2xl",
                  pool.length > 0 && !spinning ? "cursor-pointer" : "cursor-default"
                )}
                aria-hidden
              />
            </motion.div>

            {pool.length === 0 && (
              <div className="absolute inset-0 grid place-items-center text-center text-sm text-ink-300">
                <span className="rounded-2xl bg-white/10 px-5 py-3">
                  Nothing fits.
                  <br />
                  Loosen a preference.
                </span>
              </div>
            )}
          </div>

          {/* Mobile controls, directly under the wheel */}
          <p className="flex items-center gap-3 text-sm text-ink-400 md:hidden" aria-live="polite">
            {countLine}
            {activeCount > 0 && (
              <button
                onClick={() => setPrefs({ ...EMPTY, skipSeen: prefs.skipSeen })}
                className="font-semibold text-root-300"
              >
                Clear
              </button>
            )}
          </p>

          <div className="flex w-full gap-2 md:hidden">
            <button
              onClick={() => setPanelOpen(true)}
              disabled={spinning}
              className="flex min-h-[52px] items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
            >
              <SlidersHorizontal size={17} />
              Filters
              {activeCount > 0 && (
                <span className="rounded-full bg-root-500 px-1.5 text-[11px] font-bold">
                  {activeCount}
                </span>
              )}
            </button>
            <Button
              onClick={spin}
              disabled={spinning || pool.length === 0}
              size="lg"
              className="min-h-[52px] flex-1"
            >
              <RotateCw size={18} className={spinning ? "animate-spin" : ""} />
              {spinning ? "Spinning…" : winner ? "Again" : "Spin"}
            </Button>
          </div>

          <div aria-live="polite" className="w-full">
            <AnimatePresence>{winnerCard}</AnimatePresence>
          </div>
        </div>
      </div>

      {/* Preferences sheet — phones only; the desktop layout shows them inline */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-ink-900/70"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              initial={reduceMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduceMotion ? undefined : { y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              drag={reduceMotion ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => info.offset.y > 90 && setPanelOpen(false)}
              // The sheet lives outside the dark wheel card, so it takes the
              // page's theme rather than inheriting the card's dark surface.
              className="clay relative flex max-h-[86svh] w-full flex-col rounded-t-[2rem] text-ink-900 dark:text-white"
            >
              {/* Header and footer are pinned; only the middle scrolls, which
                  is what stops the last group being cut in half. */}
              <div className="shrink-0 px-5 pt-3">
                <span
                  aria-hidden
                  className="mx-auto mb-3 block h-1 w-10 rounded-full bg-ink-200 dark:bg-white/25"
                />
                <div className="flex items-center justify-between gap-3 pb-3">
                  <h3 className="font-display text-lg font-extrabold">
                    What are you in the mood for?
                  </h3>
                  <div className="flex shrink-0 items-center gap-2">
                    {activeCount > 0 && (
                      <button
                        onClick={() => setPrefs({ ...EMPTY, skipSeen: prefs.skipSeen })}
                        className="text-sm font-semibold text-root-600 dark:text-root-300"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setPanelOpen(false)}
                      aria-label="Close"
                      className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 active:scale-90 dark:bg-white/10"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
                {prefControls}
              </div>

              <div className="shrink-0 border-t border-ink-100 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 dark:border-ink-800">
                <button
                  onClick={() => setPanelOpen(false)}
                  disabled={matches.length === 0}
                  className="min-h-[52px] w-full rounded-full bg-root-500 font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
                >
                  {matches.length === 0
                    ? "Nothing matches"
                    : `Show ${matches.length} ${matches.length === 1 ? "place" : "places"}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
