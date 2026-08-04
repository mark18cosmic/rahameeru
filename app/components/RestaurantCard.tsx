"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, UtensilsCrossed } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { priceString, isOpenNow, photoUrl, cx } from "@/app/lib/utils";
import { Stars } from "./ui/Stars";
import { FavoriteButton } from "./FavoriteButton";

export function RestaurantCard({
  r,
  className = "",
}: {
  r: Restaurant;
  className?: string;
}) {
  const open = isOpenNow(r.hours);
  const [loaded, setLoaded] = useState(false);
  const dishes = r.menu?.reduce((n, s) => n + s.items.length, 0) ?? 0;

  return (
    <Link
      href={`/restaurant/${r.slug}`}
      className={cx(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-ink-100 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-card active:scale-[0.98] active:shadow-soft",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-400",
        "dark:bg-ink-900 dark:ring-ink-800",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100 dark:bg-ink-800">
        {/* Placeholder tint until the resolved photo arrives, so the card
            never flashes a broken image while /api/photo does its lookup. */}
        <Image
          src={photoUrl(r)}
          alt={r.name}
          fill
          sizes="(max-width: 768px) 70vw, 320px"
          onLoad={() => setLoaded(true)}
          className={cx(
            "object-cover transition-all duration-500 group-hover:scale-105",
            loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
          )}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <FavoriteButton id={r.id} className="absolute right-3 top-3 h-10 w-10" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-ink-800 backdrop-blur">
            {priceString(r.priceLevel)}
          </span>
          {open && (
            <span className="rounded-full bg-emerald-500/90 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
              Open
            </span>
          )}
        </div>
        {dishes > 0 && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            <UtensilsCrossed size={11} /> {dishes} dishes
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-tight text-ink-900 transition-colors group-hover:text-root-600 dark:text-white">
            {r.name}
          </h3>
          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-800 dark:text-ink-100">
            <Stars value={r.rating} size={14} />
            <span>{r.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="line-clamp-1 text-sm text-ink-500">{r.cuisine.join(" · ")}</p>
        <div className="mt-auto flex items-center gap-1 text-sm text-ink-500">
          <MapPin size={14} /> {r.location}
        </div>
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
      <div className="skeleton aspect-[4/3]" />
      <div className="flex flex-col gap-2 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}
