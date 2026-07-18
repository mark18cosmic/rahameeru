"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCw, MapPin, ArrowRight } from "lucide-react";
import type { Restaurant, PriceLevel } from "@/app/lib/types";
import { priceString } from "@/app/lib/utils";
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

export function WheelSpinner({ restaurants }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [area, setArea] = useState("All");
  const [price, setPrice] = useState<PriceLevel | 0>(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);

  const pool = useMemo(() => {
    const filtered = restaurants.filter(
      (r) =>
        (area === "All" || r.location === area) &&
        (price === 0 || r.priceLevel === price)
    );
    // Wheel is legible up to ~10 slices.
    return (filtered.length ? filtered : restaurants).slice(0, 10);
  }, [restaurants, area, price]);

  // Draw the wheel whenever the pool or rotation changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pool.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 6;
    const slice = (2 * Math.PI) / pool.length;
    const rot = (rotation * Math.PI) / 180;

    pool.forEach((r, i) => {
      const start = rot + i * slice;
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

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "600 13px Inter, system-ui, sans-serif";
      const label = r.name.length > 14 ? r.name.slice(0, 13) + "…" : r.name;
      ctx.fillText(label, radius - 14, 5);
      ctx.restore();
    });

    // Hub
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
    ctx.fillStyle = "#171512";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [pool, rotation]);

  const spin = () => {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    setWinner(null);

    const slice = 360 / pool.length;
    const winIndex = Math.floor(Math.random() * pool.length);
    const turns = 5 + Math.floor(Math.random() * 3);
    // Pointer sits at top (−90° / 270°). Land the winning slice centre there.
    const target =
      turns * 360 + (270 - (winIndex * slice + slice / 2)) - (rotation % 360);
    const final = rotation + target;
    setRotation(final);

    window.setTimeout(() => {
      setWinner(pool[winIndex]);
      setSpinning(false);
    }, 4200);
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-ink-900 p-6 text-white shadow-card md:p-10">
      <div className="relative grid items-center gap-8 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-root-300">
            <Sparkles size={14} /> Can&apos;t decide?
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-4xl">
            Spin the wheel,
            <br /> let fate feed you.
          </h2>
          <p className="mt-3 max-w-md text-ink-300">
            Stuck choosing where to eat? Give it a spin and we&apos;ll pick a
            spot for you. Narrow it down by area and budget first.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <button
                  key={a}
                  onClick={() => setArea(a)}
                  disabled={spinning}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    area === a
                      ? "bg-white text-ink-900"
                      : "bg-white/10 text-ink-200 hover:bg-white/20"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {PRICES.map((pr) => (
                <button
                  key={pr.label}
                  onClick={() => setPrice(pr.value)}
                  disabled={spinning}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    price === pr.value
                      ? "bg-white text-ink-900"
                      : "bg-white/10 text-ink-200 hover:bg-white/20"
                  }`}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={spin}
            disabled={spinning}
            size="lg"
            className="mt-6"
          >
            <RotateCw size={18} className={spinning ? "animate-spin" : ""} />
            {spinning ? "Spinning…" : "Spin the wheel"}
          </Button>
        </div>

        <div className="relative mx-auto flex flex-col items-center">
          <div className="relative">
            {/* Pointer */}
            <div className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2">
              <div className="h-0 w-0 border-x-[12px] border-t-[20px] border-x-transparent border-t-white drop-shadow" />
            </div>
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 4.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: 320, height: 320 }}
            >
              <canvas
                ref={canvasRef}
                style={{ width: 320, height: 320 }}
                className="drop-shadow-2xl"
              />
            </motion.div>
          </div>

          <AnimatePresence>
            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-5 w-full max-w-sm rounded-2xl bg-white p-3 text-ink-900 shadow-glow"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={winner.image}
                      alt={winner.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-root-500">
                      Tonight you&apos;re eating at
                    </p>
                    <h4 className="truncate font-bold">{winner.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-ink-500">
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
    </section>
  );
}
