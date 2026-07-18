"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRestaurants } from "@/app/lib/useRestaurants";
import type { SortKey } from "@/app/lib/search";
import { RestaurantCard, CardSkeleton } from "./RestaurantCard";
import { Select } from "./ui/Select";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Top rated" },
  { key: "reviews", label: "Most reviewed" },
  { key: "price-asc", label: "Cheapest first" },
  { key: "price-desc", label: "Priciest first" },
];

export function ExploreContent() {
  const params = useSearchParams();
  const { restaurants, loading } = useRestaurants();
  const [sort, setSort] = useState<SortKey>(
    (params.get("sort") as SortKey) || "rating"
  );

  const sorted = useMemo(() => {
    const list = [...restaurants];
    list.sort((a, b) => {
      switch (sort) {
        case "reviews":
          return b.reviewCount - a.reviewCount;
        case "price-asc":
          return a.priceLevel - b.priceLevel;
        case "price-desc":
          return b.priceLevel - a.priceLevel;
        default:
          return b.rating - a.rating;
      }
    });
    return list;
  }, [restaurants, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 dark:text-white md:text-4xl">
            Explore
          </h1>
          <p className="mt-1 text-ink-500">
            Every spot we love across the islands.
          </p>
        </div>
        <Select<SortKey>
          value={sort}
          onChange={setSort}
          ariaLabel="Sort restaurants"
          options={SORTS.map((s) => ({ value: s.key, label: s.label }))}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
          : sorted.map((r) => <RestaurantCard key={r.id} r={r} />)}
      </div>
    </div>
  );
}
