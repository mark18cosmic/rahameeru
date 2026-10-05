"use client";

import { useEffect, type RefObject } from "react";

export const WHEEL_COLORS = [
  "#F84B3B",
  "#F5A623",
  "#E52E1D",
  "#FF7D71",
  "#C12314",
  "#FFA8A0",
  "#A02014",
  "#FFC24B",
];

/** The pointer sits at the top of the wheel; canvas angle 0 points right. */
export const POINTER_ANGLE = 270;
export const SPIN_MS = 4200;
/**
 * Past this many slices the wheel is drawn as colour alone, with the winner
 * named underneath: labels that small are noise, not information.
 */
export const LABEL_LIMIT = 22;

/**
 * The rotation that lands slice `winIndex` under the pointer, a few full
 * turns on from `current`. Pure, so every viewer of a shared wheel computes
 * the same angle from the same result.
 */
export function targetRotation(
  current: number,
  count: number,
  winIndex: number,
  { turns = 6, jitter = 0 }: { turns?: number; jitter?: number } = {}
): number {
  const slice = 360 / count;
  const sliceCentre = (winIndex + 0.5) * slice + jitter * slice * 0.7;
  const targetMod = (((POINTER_ANGLE - sliceCentre) % 360) + 360) % 360;
  return (Math.floor(current / 360) + turns) * 360 + targetMod;
}

/** Paints the wheel for `names` onto the canvas at `size` CSS pixels. */
export function usePaintWheel(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  names: string[],
  size: number
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || names.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const n = names.length;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 6;
    const slice = (2 * Math.PI) / n;
    const hub = Math.max(18, size * 0.075);
    // Type and label length track how many slices there are, so a big pool
    // stays legible instead of turning into overlapping text.
    const dense = n > 12;
    const fontSize = Math.max(8, Math.round(size * (dense ? 0.032 : 0.042) * (n > 18 ? 0.85 : 1)));
    const maxChars = n > 18 ? 6 : n > 12 ? 9 : n > 8 ? 11 : 14;
    // next/font hashes family names, so read the real one off the page.
    const family = getComputedStyle(document.body).fontFamily;

    names.forEach((name, i) => {
      const start = i * slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + slice);
      ctx.closePath();
      // A single slice would otherwise sit next to itself in the same colour.
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = n > 18 ? 1 : 2;
      ctx.stroke();

      if (n > LABEL_LIMIT) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.font = `600 ${fontSize}px ${family}`;
      const label = name.length > maxChars ? name.slice(0, maxChars - 1) + "…" : name;
      ctx.fillText(label, radius - (dense ? 8 : 12), 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, hub, 0, 2 * Math.PI);
    ctx.fillStyle = "#151515";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [canvasRef, names, size]);
}
