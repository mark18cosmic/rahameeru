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
        "clay clay-press group flex flex-col rounded-[1.75rem] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-400 md:rounded-[2rem]",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-ink-100 dark:bg-ink-800 md:rounded-[1.6rem]">
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
            "object-cover transition-all duration-500 md:group-hover:scale-105",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
        {item.popular && (
          <span className="clay-on-color absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-root-500 px-2.5 py-1 text-[11px] font-bold text-white">
            <Flame size={11} /> Popular
          </span>
        )}
        {item.price > 0 && (
          <span className="clay-sm absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-ink-900 dark:text-white md:text-xs">
            {mvr(item.price)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-2 pb-1.5 pt-3 md:px-3 md:pb-2">
        <h3 className="line-clamp-1 font-bold leading-tight text-ink-900 dark:text-white md:group-hover:text-root-600">
          {item.name}
        </h3>
        {item.description && (
          <p className="line-clamp-1 text-[13px] text-ink-500">{item.description}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-1 text-[13px] text-ink-500">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{r.name}</span>
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1 font-semibold text-ink-700 dark:text-ink-200">
            <Star size={11} className="fill-saffron-500 text-saffron-500" />
            {r.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
