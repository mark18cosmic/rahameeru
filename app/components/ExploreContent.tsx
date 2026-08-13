"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Store, UtensilsCrossed } from "lucide-react";
import { useRestaurants } from "@/app/lib/useRestaurants";
import type { SortKey } from "@/app/lib/search";
import {
  allDishes,
  dishTags,
  rankDishes,
  searchDishes,
} from "@/app/lib/dishes";
import { cx } from "@/app/lib/utils";
import { RestaurantCard, CardSkeleton } from "./RestaurantCard";
import { DishCard } from "./DishCard";
import { Select } from "./ui/Select";
import { Input } from "./ui/Field";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Top rated" },
  { key: "reviews", label: "Most reviewed" },
  { key: "price-asc", label: "Cheapest first" },
  { key: "price-desc", label: "Priciest first" },
];

/** Dishes sort on their own terms — a dish has a price, not a price level. */
const DISH_SORTS: { key: string; label: string }[] = [
  { key: "popular", label: "Most ordered" },
  { key: "price-asc", label: "Cheapest first" },
  { key: "price-desc", label: "Priciest first" },
  { key: "name", label: "A to Z" },
];

type View = "places" | "dishes";

export function ExploreContent() {
  const params = useSearchParams();
  const { restaurants, loading } = useRestaurants();
  const [view, setView] = useState<View>(
    params.get("view") === "dishes" ? "dishes" : "places"
  );
  const [sort, setSort] = useState<SortKey>(
    (params.get("sort") as SortKey) || "rating"
  );
  const [dishSort, setDishSort] = useState(
    params.get("sort") === "price-asc" ? "price-asc" : "popular"
  );
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);

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

  const everyDish = useMemo(() => allDishes(restaurants), [restaurants]);
  const tags = useMemo(() => dishTags(everyDish), [everyDish]);

  const dishes = useMemo(() => {
    let list = searchDishes(everyDish, q);
    if (tag) list = list.filter((d) => d.item.tags?.includes(tag));
    switch (dishSort) {
      case "price-asc":
        return [...list].sort((a, b) => a.item.price - b.item.price);
      case "price-desc":
        return [...list].sort((a, b) => b.item.price - a.item.price);
      case "name":
        return [...list].sort((a, b) => a.item.name.localeCompare(b.item.name));
      default:
        return rankDishes(list);
    }
  }, [everyDish, q, tag, dishSort]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 md:px-6 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white md:text-4xl">
            Explore
          </h1>
          <p className="mt-1 text-sm text-ink-500 md:text-base">
            {view === "places"
              ? "Every spot we love across the islands."
              : "Every dish on every menu, in one place."}
          </p>
        </div>
        {view === "places" ? (
          <Select<SortKey>
            value={sort}
            onChange={setSort}
            ariaLabel="Sort restaurants"
            options={SORTS.map((s) => ({ value: s.key, label: s.label }))}
          />
        ) : (
          <Select<string>
            value={dishSort}
            onChange={setDishSort}
            ariaLabel="Sort dishes"
            options={DISH_SORTS.map((s) => ({ value: s.key, label: s.label }))}
          />
        )}
      </div>

      {/* Places or dishes — the same catalogue, cut the way you're deciding. */}
      <div className="mt-4 flex gap-2">
        {(
          [
            ["places", "Places", Store],
            ["dishes", "Dishes", UtensilsCrossed],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            aria-pressed={view === key}
            className={cx(
              "inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition sm:flex-none sm:px-6",
              view === key ? "clay-root" : "clay-sm clay-press text-ink-600 dark:text-ink-300"
            )}
          >
            <Icon size={16} />
            {label}
            <span className="text-xs opacity-70">
              {key === "places" ? restaurants.length : everyDish.length}
            </span>
          </button>
        ))}
      </div>

      {view === "dishes" && (
        <div className="mt-4">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search every menu — biryani, kottu, flat white…"
              className="pl-11"
            />
          </div>

          {tags.length > 0 && (
            <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(tag === t ? null : t)}
                  className={cx(
                    "min-h-[38px] shrink-0 rounded-full px-3.5 text-xs font-semibold transition",
                    tag === t ? "clay-root" : "clay-sm clay-press text-ink-600 dark:text-ink-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "places" ? (
        <div className="mt-5 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {/* Skeletons only when there is genuinely nothing to draw — the seed
              set means that is almost never. */}
          {loading && sorted.length === 0
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : sorted.map((r) => <RestaurantCard key={r.id} r={r} />)}
        </div>
      ) : dishes.length === 0 ? (
        <p className="clay-inset mt-6 rounded-[1.5rem] p-10 text-center text-ink-500">
          No dish matches that. Try a shorter word.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {dishes.map((d) => (
            <DishCard key={d.id} entry={d} />
          ))}
        </div>
      )}
    </div>
  );
}
