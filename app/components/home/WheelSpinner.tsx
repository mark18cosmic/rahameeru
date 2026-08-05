"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, RotateCw, MapPin, ArrowRight } from "lucide-react";
import type { Restaurant, PriceLevel } from "@/app/lib/types";
import { priceString } from "@/app/lib/utils";
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

const AREAS = ["All", "Malé", "Hulhumalé"];
const PRICES: { label: string; value: PriceLevel | 0 }[] = [
  { label: "Any", value: 0 },
  { label: "$", value: 1 },
  { label: "$$", value: 2 },
  { label: "$$$", value: 3 },
  { label: "$$$$", value: 4 },
];

/** The pointer sits at the top of the wheel; canvas angle 0 points right. */
const POINTER_ANGLE = 270;
const SPIN_MS = 4200;

export function WheelSpinner({ restaurants }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState("All");
  const [price, setPrice] = useState<PriceLevel | 0>(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [size, setSize] = useState(300);
  const reduceMotion = useReducedMotion();

  const pool = useMemo(() => {
    const filtered = restaurants.filter(
      (r) =>
        (area === "All" || r.location === area) &&
        (price === 0 || r.priceLevel === price)
    );
    // Wheel is legible up to ~10 slices.
    return (filtered.length ? filtered : restaurants).slice(0, 10);
  }, [restaurants, area, price]);

  // Fit the wheel to its column, so it never overflows a narrow phone.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      // Phones get a deliberately smaller wheel: at full column width it ate
      // the whole screen and pushed the spin button below the fold.
      const cap = window.innerWidth < 640 ? 258 : 360;
      setSize(Math.max(200, Math.min(cap, Math.floor(w))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /**
   * Draws the wheel in its neutral orientation. Rotation is applied purely by
   * the CSS transform on the wrapper — baking it into the canvas as well would
   * double every angle and land the pointer on the wrong slice.
   */
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
      const end = start + slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label, laid along the slice's centre line.
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

    // Hub
    ctx.beginPath();
    ctx.arc(cx, cy, hub, 0, 2 * Math.PI);
    ctx.fillStyle = "#171512";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [pool, size]);

  const spin = useCallback(() => {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    setWinner(null);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }

    const slice = 360 / pool.length;
    const winIndex = Math.floor(Math.random() * pool.length);

    // Centre of the winning slice in the wheel's own (unrotated) coordinates.
    // Nudge within the slice so it doesn't stop dead-centre every time, while
    // staying well clear of the dividing lines.
    const jitter = (Math.random() - 0.5) * slice * 0.7;
    const sliceCentre = (winIndex + 0.5) * slice + jitter;

    // Solve for the final rotation R that puts that centre under the pointer:
    //   sliceCentre + R ≡ POINTER_ANGLE  (mod 360)
    const targetMod = (((POINTER_ANGLE - sliceCentre) % 360) + 360) % 360;
    const turns = 5 + Math.floor(Math.random() * 3);
    // Keep the whole-turn count already accumulated so the wheel only ever
    // spins forward, then add the turns plus the offset that lands the winner.
    const final = (Math.floor(rotation / 360) + turns) * 360 + targetMod;

    setRotation(final);

    window.setTimeout(
      () => {
        setWinner(pool[winIndex]);
        setSpinning(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([20, 40, 20]);
        }
      },
      reduceMotion ? 300 : SPIN_MS
    );
  }, [spinning, pool, rotation, reduceMotion]);

  return (
    <section id="wheel" className="relative scroll-mt-24 overflow-hidden rounded-[1.75rem] bg-ink-900 p-4 text-white shadow-card sm:rounded-[2rem] sm:p-6 md:p-10">
      <div className="relative grid items-center gap-6 md:grid-cols-2 md:gap-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-root-300">
            <Sparkles size={14} /> Can&apos;t decide?
          </span>
          <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-3xl md:mt-4 md:text-4xl">
            Let the wheel
            <br /> decide for you.
          </h2>
          <p className="mt-2 max-w-md text-sm text-ink-300 md:mt-3 md:text-base">
            Twenty minutes of arguing about dinner, solved in one spin. Narrow it
            down by island and budget first if you want.
          </p>

          <div className="mt-4 space-y-2.5 md:mt-6 md:space-y-3">
            <fieldset>
              <legend className="sr-only">Filter by island</legend>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setArea(a)}
                    disabled={spinning}
                    aria-pressed={area === a}
                    className={`min-h-[40px] rounded-full px-3.5 text-[13px] font-medium transition active:scale-95 disabled:opacity-60 md:min-h-[44px] md:px-4 md:text-sm ${
                      area === a
                        ? "bg-white text-ink-900"
                        : "bg-white/10 text-ink-200 hover:bg-white/20"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="sr-only">Filter by price</legend>
              <div className="flex flex-wrap gap-2">
                {PRICES.map((pr) => (
                  <button
                    key={pr.label}
                    onClick={() => setPrice(pr.value)}
                    disabled={spinning}
                    aria-pressed={price === pr.value}
                    className={`min-h-[40px] rounded-full px-3.5 text-[13px] font-medium transition active:scale-95 disabled:opacity-60 md:min-h-[44px] md:px-4 md:text-sm ${
                      price === pr.value
                        ? "bg-white text-ink-900"
                        : "bg-white/10 text-ink-200 hover:bg-white/20"
                    }`}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <p className="mt-3 text-sm text-ink-400 md:mt-4">
            {pool.length} {pool.length === 1 ? "place" : "places"} on the wheel
          </p>

          <Button onClick={spin} disabled={spinning} size="lg" className="mt-3 w-full sm:w-auto">
            <RotateCw size={18} className={spinning ? "animate-spin" : ""} />
            {spinning ? "Spinning…" : winner ? "Spin again" : "Spin the wheel"}
          </Button>
        </div>

        <div className="relative mx-auto flex w-full max-w-[276px] flex-col items-center sm:max-w-[360px]">
          <div ref={wrapRef} className="relative w-full" style={{ height: size }}>
            {/* Pointer */}
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
                style={{ width: size, height: size }}
                className="drop-shadow-2xl"
                aria-hidden
              />
            </motion.div>
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
