"use client";

import Link from "next/link";
import type { DishEntry } from "@/app/lib/dishes";
import { DishCard } from "../DishCard";
import { RailHeader } from "./RestaurantRail";

/**
 * A horizontal rail of dishes, matching the restaurant rails either side of it.
 *
 * Deliberately the same shape as RestaurantRail rather than a new pattern: the
 * home page already teaches "swipe this row", and a dish is browsed the same
 * way a place is.
 */
export function DishRail({
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
    <section className="mt-10 md:mt-16">
      <RailHeader title={title} subtitle={subtitle} href={href} />

      {/* Padding matches RestaurantRail: surface throws a deep shadow and lifts on
          hover, and overflow-x-auto clips both axes. */}
      <div className="scrollbar-hide -mx-5 flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-pl-5 px-5 pb-7 pt-2 md:mx-0 md:scroll-pl-0 md:gap-4 md:px-0">
        {dishes.map((d) => (
          <div key={d.id} className="w-[200px] shrink-0 snap-start md:w-[240px]">
            <DishCard entry={d} />
          </div>
        ))}
        <div aria-hidden className="w-2 shrink-0 md:hidden" />
      </div>
    </section>
  );
}
