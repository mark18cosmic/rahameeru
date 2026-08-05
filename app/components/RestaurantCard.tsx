"use client";

import Link from "next/link";
import { MapPin, UtensilsCrossed, Star } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { priceString, isOpenNow, cx } from "@/app/lib/utils";
import { Photo } from "./ui/Photo";
import { FavoriteButton } from "./FavoriteButton";

export function RestaurantCard({
  r,
  className = "",
}: {
  r: Restaurant;
  className?: string;
}) {
  const open = isOpenNow(r.hours);
  const dishes = r.menu?.reduce((n, s) => n + s.items.length, 0) ?? 0;

  return (
    <Link
      href={`/restaurant/${r.slug}`}
      className={cx(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink-100 transition-all duration-300 md:rounded-3xl",
        "active:scale-[0.98] active:shadow-soft md:hover:-translate-y-1 md:hover:shadow-card",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-400",
        "dark:bg-ink-900 dark:ring-ink-800",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100 dark:bg-ink-800">
        {/* Lazy by default — a rail can hold dozens of cards, and only the ones
            actually scrolled to should cost a request. */}
        <Photo
          r={r}
          sizes="(max-width: 768px) 70vw, 320px"
          className="duration-500 md:group-hover:scale-105"
        />
        {/* One badge per corner. Two stacked chips plus a heart used to collide
            on a half-width phone card, which is where the overlap came from —
            price now lives in the body row instead. */}
        {open && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[11px] font-bold text-white shadow-sm md:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
            Open
          </span>
        )}
        <FavoriteButton
          id={r.id}
          size={16}
          className="absolute right-3 top-3 h-9 w-9 md:h-10 md:w-10"
        />
        {/* Rating sits on the photo where it reads at a glance; the body below
            is then just words, with nothing competing for the same corner. */}
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-ink-900 shadow-sm md:text-xs">
          <Star size={11} className="fill-saffron-500 text-saffron-500" />
          {r.rating.toFixed(1)}
          <span className="font-medium text-ink-400">({r.reviewCount})</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 md:gap-1.5 md:p-4">
        <h3 className="line-clamp-1 font-bold leading-tight text-ink-900 transition-colors dark:text-white md:group-hover:text-root-600">
          {r.name}
        </h3>
        <p className="line-clamp-1 text-[13px] text-ink-500">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {priceString(r.priceLevel)}
          </span>
          {r.cuisine.length > 0 && <> · {r.cuisine.join(" · ")}</>}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-1 text-[13px] text-ink-500">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{r.location}</span>
          </span>
          {dishes > 0 && (
            <span className="ml-auto hidden shrink-0 items-center gap-1 text-ink-400 sm:flex">
              <UtensilsCrossed size={12} /> {dishes}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800 md:rounded-3xl">
      <div className="skeleton aspect-[4/3]" />
      <div className="flex flex-col gap-2 p-3 md:p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}
