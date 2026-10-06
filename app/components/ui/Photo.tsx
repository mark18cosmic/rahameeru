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
  const chain = stored === looked ? [looked] : [stored, looked];

  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // A different restaurant in the same slot (rails re-use nodes) starts over.
  useEffect(() => {
    setStep(0);
    setLoaded(false);
  }, [r.id, index]);

  // Past the last source means nothing was found: show the name tile.
  const next = () => setStep((s) => s + 1);

  if (step >= chain.length) return <NameTile name={r.name} />;

  return (
    <>
      {/* Shimmer until the photo arrives, so a card never sits as a flat
          grey box wondering whether anything is coming. */}
      {!loaded && <span aria-hidden className="skeleton absolute inset-0" />}
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
          const img = e.currentTarget;
          if (img.naturalWidth <= 2) next();
          else setLoaded(true);
        }}
        className={cx(
          "object-cover transition-all duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </>
);
}

/**
 * When no photo exists anywhere: the place's initials on a soft coral tile.
 * Reads as deliberate, unlike a generic drawing of cutlery repeated on every
 * listing that hasn't been photographed yet.
 */
function NameTile({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[\p{L}\p{N}]/u.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className="absolute inset-0 grid place-items-center bg-root-50 font-display font-bold text-root-300 dark:bg-root-500/10 dark:text-root-400/60"
      style={{ containerType: "size" }}
    >
      <span style={{ fontSize: "clamp(1rem, 30cqmin, 5rem)" }}>{initials}</span>
    </span>
  );
}
