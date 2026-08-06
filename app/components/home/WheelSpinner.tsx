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
/** Slices past this stop being readable, so the pool is sampled down to it. */
const MAX_SLICES = 10;

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

  /** Slices actually drawn: a random sample, so a big pool isn't just A–J. */
  const pool = useMemo(() => {
    if (matches.length <= MAX_SLICES) return matches;
    const copy = [...matches];
    const out: Restaurant[] = [];
    while (out.length < MAX_SLICES && copy.length) {
      out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out;
    // Re-sampled whenever the filters change, not on every render.
  }, [matches]);

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
    const hub = Math.max(20, size * 0.08);
    const fontSize = Math.max(10, Math.round(size * 0.042));
    const maxChars = pool.length > 8 ? 11 : 14;

    pool.forEach((r, i) => {
      const start = i * slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      const label =
        r.name.length > maxChars ? r.name.slice(0, maxChars - 1) + "…" : r.name;
      ctx.fillText(label, radius - 12, 0);
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
        "inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition active:scale-95 disabled:opacity-50",
        on ? "bg-white text-ink-900" : "bg-white/10 text-ink-200 hover:bg-white/20"
      )}
    >
      {children}
    </button>
  );

  return (
    <section
      id="wheel"
      className="relative scroll-mt-24 overflow-hidden rounded-[1.75rem] bg-ink-900 p-4 text-white shadow-card sm:rounded-[2rem] sm:p-6 md:p-10"
    >
      <div className="relative grid items-center gap-6 md:grid-cols-2 md:gap-8">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-root-300">
            <Sparkles size={14} /> Can&apos;t decide?
          </span>
          <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-3xl md:mt-4 md:text-4xl">
            Let the wheel
            <br /> decide for you.
          </h2>
          <p className="mt-2 max-w-md text-sm text-ink-300 md:mt-3 md:text-base">
            Tell it what you&apos;re in the mood for and it only spins places you
            would actually say yes to.
          </p>

          {/* Quick preferences, always visible */}
          <div className="scrollbar-hide -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
            <Chip
              on={prefs.openNow}
              disabled={spinning}
              onClick={() => setPrefs((p) => ({ ...p, openNow: !p.openNow }))}
            >
              <Clock3 size={14} /> Open now
            </Chip>
            {facets.areas.slice(0, 3).map((a) => (
              <Chip
                key={a}
                on={prefs.areas.includes(a)}
                disabled={spinning}
                onClick={() => setPrefs((p) => ({ ...p, areas: toggle(p.areas, a) }))}
              >
                <MapPin size={14} /> {a}
              </Chip>
            ))}
            {PRICES.map((pr) => (
              <Chip
                key={pr.label}
                on={prefs.prices.includes(pr.value)}
                disabled={spinning}
                onClick={() =>
                  setPrefs((p) => ({ ...p, prices: toggle(p.prices, pr.value) }))
                }
              >
                {pr.label}
              </Chip>
            ))}
            <Chip on={panelOpen} disabled={spinning} onClick={() => setPanelOpen((v) => !v)}>
              <SlidersHorizontal size={14} /> More
              {activeCount > 0 && (
                <span className="rounded-full bg-root-500 px-1.5 text-[11px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </Chip>
          </div>

          {/* Everything else, folded away until asked for */}
          <AnimatePresence initial={false}>
            {panelOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3 rounded-2xl bg-white/5 p-3.5">
                  <Group label="Cuisine">
                    {facets.cuisines.map((c) => (
                      <Chip
                        key={c}
                        on={prefs.cuisines.includes(c)}
                        disabled={spinning}
                        onClick={() =>
                          setPrefs((p) => ({ ...p, cuisines: toggle(p.cuisines, c) }))
                        }
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
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-3 text-sm text-ink-400" aria-live="polite">
            {matches.length === 0
              ? "Nothing matches — loosen something."
              : `${matches.length} ${matches.length === 1 ? "place" : "places"} match` +
                (matches.length > MAX_SLICES ? `, ${MAX_SLICES} on the wheel` : "")}
          </p>

          <Button
            onClick={spin}
            disabled={spinning || pool.length === 0}
            size="lg"
            className="mt-3 w-full sm:w-auto"
          >
            <RotateCw size={18} className={spinning ? "animate-spin" : ""} />
            {spinning ? "Spinning…" : winner ? "Spin again" : "Spin the wheel"}
          </Button>
        </div>

        <div className="relative mx-auto flex w-full max-w-[300px] flex-col items-center sm:max-w-[360px]">
          <div ref={wrapRef} className="relative w-full" style={{ height: size }}>
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
              {/* The wheel is the button too — tapping it spins. */}
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
              <div className="absolute inset-0 grid place-items-center rounded-full bg-white/5 text-center text-sm text-ink-300">
                <span className="px-6">
                  No places fit those preferences.
                  <br />
                  Try clearing one.
                </span>
              </div>
            )}
          </div>

          <div aria-live="polite" className="w-full">
            <AnimatePresence>
              {winner && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 w-full rounded-2xl bg-white p-3 text-ink-900 shadow-glow"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                      <Photo r={winner} sizes="64px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-root-500">
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
                    <ButtonLink
                      href={`/restaurant/${winner.slug}`}
                      size="sm"
                      className="shrink-0"
                    >
                      Go <ArrowRight size={14} />
                    </ButtonLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
