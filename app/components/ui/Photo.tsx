"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Restaurant } from "@/app/lib/types";
import { photoUrl, apiPhotoUrl, cx } from "@/app/lib/utils";

/**
 * A 4×3 grey PNG. `next/image` blurs and scales whatever it is given, so a
 * single flat tint is all that is needed to stop the layout flashing white
 * while a lazy image is still off-screen or in flight.
 */
export const BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAHElEQVQI12N88uQJAxJgYmBg+P//PxMDAwMDAwMAJg0F/2vBHQMAAAAASUVORK5CYII=";

/**
 * Rendered when even the lookup endpoint has nothing — never a broken icon.
 * Inlined as a data URI on purpose: `next/image` passes those through
 * untouched, so it works without loosening the SVG rules in next.config.
 */
const PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4f1ec"/><stop offset="1" stop-color="#e3ddd3"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g)"/>
      <g fill="none" stroke="#b9ae9c" stroke-width="6" stroke-linecap="round">
        <path d="M172 118v64M186 118v64M179 182v42"/>
        <path d="M214 224v-42c-10 0-18-8-18-18v-30c0-9 8-16 18-16s18 7 18 16v90"/>
      </g>
    </svg>`
  );

type Props = {
  r: Restaurant;
  /** Gallery slot. 0 is the primary photo. */
  index?: number;
  alt?: string;
  sizes: string;
  className?: string;
  /** Skip lazy loading. Only for images already in the first viewport. */
  priority?: boolean;
};

/**
 * Restaurant photo with a self-healing source chain.
 *
 * Order: the stored (Firestore) URL → the keyless lookup at /api/photo →
 * a bundled placeholder. A stored URL that 404s, expires, or serves an empty
 * 1×1 is swapped out on the fly, so a stale database row can no longer leave a
 * hole in the grid.
 *
 * Everything below the fold loads lazily — `next/image` defers off-screen
 * requests by default, and the blur placeholder holds the space until then.
 */
export function Photo({
  r,
  index = 0,
  alt,
  sizes,
  className = "",
  priority = false,
}: Props) {
  const stored = photoUrl(r, index);
  const looked = apiPhotoUrl(r, index);
  // De-duplicated: when the doc has no image, photoUrl already is the lookup.
  const chain = stored === looked ? [looked, PLACEHOLDER] : [stored, looked, PLACEHOLDER];

  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // A different restaurant in the same slot (rails re-use nodes) starts over.
  useEffect(() => {
    setStep(0);
    setLoaded(false);
  }, [r.id, index]);

  const next = () => setStep((s) => Math.min(s + 1, chain.length - 1));

  return (
    <Image
      src={chain[step]}
      alt={alt ?? r.name}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      placeholder="blur"
      blurDataURL={BLUR}
      onError={next}
      onLoad={(e) => {
        // /api/photo answers with a 1×1 gif when every candidate host fails;
        // treat that as a failure rather than showing an empty box.
        const img = e.currentTarget;
        if (img.naturalWidth <= 2 && step < chain.length - 1) next();
        else setLoaded(true);
      }}
      className={cx(
        "object-cover transition-all duration-500",
        loaded ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
}
