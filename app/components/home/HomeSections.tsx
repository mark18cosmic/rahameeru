"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import type { DishEntry } from "@/app/lib/dishes";
import { cx, priceString } from "@/app/lib/utils";
import { RestaurantCard, CardSkeleton } from "../RestaurantCard";
import { Photo } from "../ui/Photo";
import { RailHeader, RestaurantRail } from "./RestaurantRail";

/*
 * The home page's non-rail sections. Eight identical swipe rows in a column
 * read as one long undifferentiated feed, so each block here has a layout
 * that suits its content: a lead story, a menu, a short list.
 */

/**
 * The editor's picks as a lead grid: one large place and four smaller ones on
 * wide screens. Phones keep the swipe row, where a grid would just be a very
 * tall stack.
 */
export function FeaturedGrid({
  title,
  subtitle,
  restaurants,
  loading,
  href,
}: {
  title: string;
  subtitle?: string;
  restaurants: Restaurant[];
  loading?: boolean;
  href?: string;
}) {
  if (!loading && restaurants.length === 0) return null;
  const picks = restaurants.slice(0, 5);

  return (
    <>
      <div className="md:hidden">
        <RestaurantRail
          title={title}
          subtitle={subtitle}
          restaurants={restaurants}
          loading={loading}
          href={href}
        />
      </div>

      <section className="mt-16 hidden md:block">
        <RailHeader title={title} subtitle={subtitle} href={href} />
        <div className="grid grid-cols-4 gap-x-5 gap-y-8">
          {loading && picks.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                  <CardSkeleton />
                </div>
              ))
            : picks.map((r, i) => (
                <RestaurantCard
                  key={r.id}
                  r={r}
                  lead={i === 0}
                  className={i === 0 ? "col-span-2 row-span-2" : ""}
                />
              ))}
        </div>
      </section>
    </>
  );
}

const mvr = (n: number) => `MVR ${Math.round(n).toLocaleString()}`;

/**
 * The cheapest plates, set like a printed menu: dish, where it is served, a
 * dotted leader, the price. Cheap food is about the number, and a photo
 * card per dish buried the number under a stock picture.
 */
export function MenuList({
  title,
  subtitle,
  dishes,
  href,
}: {
  title: string;
  subtitle?: string;
  dishes: DishEntry[];
  href?: string;
}) {
  if (dishes.length === 0) return null;

  return (
    <section className="mt-12 md:mt-20">
      <RailHeader title={title} subtitle={subtitle} href={href} />
      <ul className="surface grid gap-x-12 rounded-3xl px-5 py-2 md:grid-cols-2 md:px-8 md:py-4">
        {dishes.slice(0, 10).map((d, i) => (
          // Ten fill two columns on wide screens; six is plenty on a phone.
          <li key={d.id} className={i >= 6 ? "hidden md:block" : undefined}>
            <Link
              href={`/restaurant/${d.restaurant.slug}?dish=${encodeURIComponent(d.item.name)}`}
              className="group block min-h-[56px] py-3"
            >
              <span className="flex items-baseline gap-2">
                <span className="truncate font-medium text-ink-900 transition-colors group-hover:text-root-600 dark:text-white">
                  {d.item.name}
                </span>
                <span
                  aria-hidden
                  className="min-w-[1.5rem] flex-1 border-b border-dotted border-ink-300 dark:border-ink-600"
                />
                <span className="shrink-0 font-semibold tabular-nums text-ink-900 dark:text-white">
                  {mvr(d.item.price)}
                </span>
              </span>
              <span className="block truncate text-[13px] text-ink-500 dark:text-ink-400">
                {d.restaurant.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type Occasion = {
  key: string;
  label: string;
  subtitle: string;
  restaurants: Restaurant[];
  href: string;
};

/**
 * Date night, coffee and a quick bite used to be three rails in a row with
 * the same shape. They answer one question (what kind of evening is this?),
 * so they share one rail and the tabs pick the answer.
 */
export function OccasionRail({
  occasions,
  loading,
  initial,
}: {
  occasions: Occasion[];
  loading?: boolean;
  /** The tab to open on, e.g. coffee in the morning. */
  initial?: string;
}) {
  const usable = occasions.filter((o) => o.restaurants.length > 0);
  const [active, setActive] = useState(initial ?? usable[0]?.key);
  const current = usable.find((o) => o.key === active) ?? usable[0];
  if (!current) return null;

  const tabs = usable.length > 1 && (
    <div
      role="tablist"
      aria-label="Occasion"
      className="scrollbar-hide -mx-5 mb-4 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0"
    >
      {usable.map((o) => {
        const on = o.key === current.key;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={on}
            onClick={() => setActive(o.key)}
            className={cx(
              "min-h-[40px] shrink-0 rounded-full border px-4 text-sm font-medium transition active:scale-[0.98]",
              on
                ? "border-ink-900 bg-ink-900 text-white dark:border-white dark:bg-white dark:text-ink-900"
                : "border-[var(--line)] text-ink-600 hover:border-[var(--line-strong)] dark:text-ink-300"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <RestaurantRail
      // Keyed so switching tabs starts the new row from its first card.
      key={current.key}
      title="Pick by the occasion"
      subtitle={current.subtitle}
      restaurants={current.restaurants}
      loading={loading}
      href={current.href}
      toolbar={tabs}
    />
  );
}

/**
 * New listings as short rows: a thumbnail and the facts. These are places
 * nobody has formed an opinion on yet, so they get a quieter treatment than
 * the picks above.
 */
export function CompactList({
  title,
  subtitle,
  restaurants,
  href,
}: {
  title: string;
  subtitle?: string;
  restaurants: Restaurant[];
  href?: string;
}) {
  if (restaurants.length === 0) return null;

  return (
    <section className="mt-12 md:mt-20">
      <RailHeader title={title} subtitle={subtitle} href={href} />
      <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.slice(0, 6).map((r) => (
          <li key={r.id}>
            <Link
              href={`/restaurant/${r.slug}`}
              className="group flex items-center gap-3.5 rounded-2xl py-2.5"
            >
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                <Photo r={r} sizes="64px" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink-900 transition-colors group-hover:text-root-600 dark:text-white">
                  {r.name}
                </span>
                <span className="block truncate text-[13px] text-ink-500 dark:text-ink-400">
                  {priceString(r.priceLevel)} · {r.cuisine.join(", ")}
                </span>
                <span className="block truncate text-[13px] text-ink-500 dark:text-ink-400">
                  {r.location}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-ink-800 dark:text-ink-100">
                <Star size={12} className="fill-saffron-500 text-saffron-500" />
                {r.rating.toFixed(1)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
