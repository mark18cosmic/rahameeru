"use client";

import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import type { DishEntry } from "@/app/lib/dishes";
import { cx } from "@/app/lib/utils";
import { DishCard } from "../DishCard";

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
  icon: Icon,
  accent = "root",
  href,
}: {
  title: string;
  subtitle?: string;
  dishes: DishEntry[];
  icon?: LucideIcon;
  accent?: "root" | "saffron";
  href?: string;
}) {
  if (dishes.length === 0) return null;

  return (
    <section className="mt-8 md:mt-12">
      <div className="mb-3 flex items-end justify-between gap-3 md:mb-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink-900 dark:text-white md:text-3xl">
            {Icon && (
              <span
                className={cx(
                  "clay-on-color grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white md:h-9 md:w-9",
                  accent === "root" ? "bg-root-500" : "bg-saffron-500"
                )}
              >
                <Icon size={17} />
              </span>
            )}
            <span className="truncate">{title}</span>
          </h2>
          {subtitle && (
            <p className="mt-0.5 line-clamp-1 text-sm text-ink-500 md:mt-1 md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-root-600 transition-all hover:gap-2 hover:text-root-700"
          >
            See all <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* Padding matches RestaurantRail: clay throws a deep shadow and lifts on
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
