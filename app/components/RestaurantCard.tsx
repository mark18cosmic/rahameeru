"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { priceString, isOpenNow } from "@/app/lib/utils";
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
  return (
    <Link
      href={`/restaurant/${r.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:bg-ink-900 dark:ring-ink-800 ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={r.image}
          alt={r.name}
          fill
          sizes="(max-width: 768px) 70vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <FavoriteButton id={r.id} className="absolute right-3 top-3 h-9 w-9" />
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
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-tight text-ink-900 dark:text-white">
            {r.name}
          </h3>
          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-800 dark:text-ink-100">
            <Stars value={r.rating} size={14} />
            <span>{r.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-ink-500 line-clamp-1">
          {r.cuisine.join(" · ")}
        </p>
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
