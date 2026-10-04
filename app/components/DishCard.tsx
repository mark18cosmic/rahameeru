"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Flame, MapPin, Star } from "lucide-react";
import type { DishEntry } from "@/app/lib/dishes";
import { cx, dishPhotoUrl } from "@/app/lib/utils";
import { BLUR } from "./ui/Photo";

const mvr = (n: number) => `MVR ${Math.round(n).toLocaleString()}`;

/**
 * A dish, with the place that serves it.
 *
 * The link lands on the restaurant's menu tab rather than the page top —
 * someone who tapped a dish wants that dish, not the venue's opening hours.
 *
 * The photo is looked up by dish name and stays lazy: a rail can hold twenty
 * of these, and only the ones actually scrolled to should cost a request.
 */
export function DishCard({ entry, className = "" }: { entry: DishEntry; className?: string }) {
  const { item, restaurant: r } = entry;
  const [src, setSrc] = useState(
    item.image || dishPhotoUrl(item.name, r.name, r.cuisine)
  );
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={`/restaurant/${r.slug}?dish=${encodeURIComponent(item.name)}`}
      className={cx(
        "group flex flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bg)]",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800">
        <Image
          src={src}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 60vw, 260px"
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR}
          onLoad={(e) => {
            // /api/photo answers with a 1×1 gif when every host fails; fall
            // back to the restaurant's own photo rather than an empty box.
            const img = e.currentTarget;
            if (img.naturalWidth <= 2 && !item.image) setSrc(`/api/photo?q=${encodeURIComponent(r.name)}`);
            else setLoaded(true);
          }}
          className={cx(
            "object-cover transition-all duration-700 md:group-hover:scale-[1.03]",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-0.5 pt-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold leading-snug text-ink-900 dark:text-white">
            {item.name}
          </h3>
          {item.price > 0 && (
            <span className="shrink-0 text-[13px] font-semibold tabular-nums text-ink-800 dark:text-ink-100">
              {mvr(item.price)}
            </span>
          )}
        </div>
        {item.description && (
          <p className="line-clamp-1 text-[13px] text-ink-500 dark:text-ink-400">{item.description}</p>
        )}
        <p className="flex items-center gap-1 text-[13px] text-ink-500 dark:text-ink-400">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{r.name}</span>
          {/* Said in words under the photo rather than stamped on it. */}
          {item.popular && (
            <span className="flex shrink-0 items-center gap-0.5 font-medium text-root-600 dark:text-root-400">
              <Flame size={11} /> Popular
            </span>
          )}
          <span className="ml-auto flex shrink-0 items-center gap-1">
            <Star size={11} className="fill-saffron-500 text-saffron-500" />
            {r.rating.toFixed(1)}
          </span>
        </p>
      </div>
    </Link>
  );
}
