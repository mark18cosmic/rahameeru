"use client";

import Link from "next/link";
import { MapPin, UtensilsCrossed, Star } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { priceString, cx } from "@/app/lib/utils";
import { openLabel, openState } from "@/app/lib/clock";
import { useNow } from "@/app/lib/useClock";
import { Photo } from "./ui/Photo";
import { FavoriteButton } from "./FavoriteButton";

export function RestaurantCard({
  r,
  className = "",
  lead = false,
}: {
  r: Restaurant;
  className?: string;
  /** The large first card of a lead grid: the photo fills the spare height. */
  lead?: boolean;
}) {
  // Null until mounted: the page HTML is built ahead of time, so the status
  // is filled in from the visitor's clock rather than the build machine's.
  const now = useNow();
  const state = now ? openState(r.hours, now) : null;
  const status = state && openLabel(state);
  const closingSoon = state?.kind === "open" && !state.allDay && state.closesInMin <= 60;
  const dishes = r.menu?.reduce((n, s) => n + s.items.length, 0) ?? 0;

  return (
    <Link
      href={`/restaurant/${r.slug}`}
      className={cx(
        // No frame: the photo is the card, and the words sit on the page under
        // it, the way a printed guide lays out a listing. A box around every
        // card only added edges for the eye to step over.
        "group relative flex flex-col rounded-2xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bg)]",
        className
      )}
    >
      <div
        className={cx(
          "relative overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800",
          lead ? "aspect-[4/3] md:aspect-auto md:min-h-[320px] md:flex-1" : "aspect-[4/3]"
        )}
      >
        {/* Lazy by default. A rail can hold dozens of cards, and only the ones
            actually scrolled to should cost a request. */}
        <Photo
          r={r}
          sizes={lead ? "(max-width: 768px) 70vw, 640px" : "(max-width: 768px) 70vw, 320px"}
          className="duration-700 md:group-hover:scale-[1.03]"
        />
        {status && (
          <span className="surface absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-ink-800 dark:text-ink-100 md:text-xs">
            <span
              className={cx(
                "h-1.5 w-1.5 rounded-full",
                state?.kind !== "open"
                  ? "bg-ink-400"
                  : closingSoon
                    ? "bg-root-500"
                    : "bg-emerald-500"
              )}
            />
            {status}
          </span>
        )}
        <FavoriteButton
          id={r.id}
          size={16}
          className="absolute right-2.5 top-2.5 h-9 w-9"
        />
      </div>

      <div className={cx("flex flex-col gap-0.5 px-0.5 pt-2.5", !lead && "flex-1")}>
        <div className="flex items-baseline justify-between gap-2">
          <h3
            className={cx(
              "line-clamp-1 font-semibold leading-snug text-ink-900 dark:text-white",
              lead && "md:font-display md:text-2xl md:font-bold md:tracking-tight"
            )}
          >
            {r.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-ink-800 dark:text-ink-100">
            <Star size={12} className="fill-saffron-500 text-saffron-500" />
            {r.rating.toFixed(1)}
            <span className="hidden font-normal text-ink-400 sm:inline">({r.reviewCount})</span>
          </span>
        </div>
        <p className="line-clamp-1 text-[13px] text-ink-500 dark:text-ink-400">
          {priceString(r.priceLevel)}
          {r.cuisine.length > 0 && <> · {r.cuisine.join(", ")}</>}
        </p>
        <p className="flex items-center gap-1 text-[13px] text-ink-500 dark:text-ink-400">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{r.location}</span>
          {dishes > 0 && (
            <span className="ml-auto hidden shrink-0 items-center gap-1 sm:flex">
              <UtensilsCrossed size={12} /> {dishes}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="skeleton aspect-[4/3] rounded-2xl" />
      <div className="flex flex-col gap-2 px-0.5 pt-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}
