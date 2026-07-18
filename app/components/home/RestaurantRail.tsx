"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { RestaurantCard, CardSkeleton } from "../RestaurantCard";

export function RestaurantRail({
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

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white md:text-3xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-ink-500">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-root-600 hover:gap-2 transition-all"
          >
            See all <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div className="scrollbar-hide -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[240px] shrink-0 snap-start md:w-[280px]">
                <CardSkeleton />
              </div>
            ))
          : restaurants.map((r) => (
              <div key={r.id} className="w-[240px] shrink-0 snap-start md:w-[280px]">
                <RestaurantCard r={r} />
              </div>
            ))}
      </div>
    </section>
  );
}
