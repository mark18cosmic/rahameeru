"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Star } from "lucide-react";
import { useRestaurants } from "@/app/lib/useRestaurants";
import {
  buildFuse,
  runSearch,
  emptyFilters,
  facetsOf,
  activeFilterCount,
  type SearchFilters,
  type SortKey,
} from "@/app/lib/search";
import type { PriceLevel } from "@/app/lib/types";
import { RestaurantCard, CardSkeleton } from "../RestaurantCard";
import { Input } from "../ui/Field";

const PRICES: PriceLevel[] = [1, 2, 3, 4];
const RATINGS = [4.5, 4, 3.5, 3];
const SORTS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Best match" },
  { key: "rating", label: "Top rated" },
  { key: "reviews", label: "Most reviewed" },
  { key: "price-asc", label: "$ → $$$$" },
  { key: "price-desc", label: "$$$$ → $" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-root-500 bg-root-500 text-white"
          : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
      }`}
    >
      {children}
    </button>
  );
}

export function SearchExperience() {
  const params = useSearchParams();
  const router = useRouter();
  const { restaurants, loading } = useRestaurants();
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Seed query from URL (?q=)
  useEffect(() => {
    const q = params.get("q") ?? "";
    setFilters((f) => ({ ...f, query: q }));
  }, [params]);

  const fuse = useMemo(() => buildFuse(restaurants), [restaurants]);
  const facets = useMemo(() => facetsOf(restaurants), [restaurants]);
  const results = useMemo(
    () => runSearch(restaurants, fuse, filters, sort),
    [restaurants, fuse, filters, sort]
  );
  const count = activeFilterCount(filters);

  const toggle = <K extends keyof SearchFilters>(
    key: K,
    value: any
  ) => {
    setFilters((f) => {
      const arr = f[key] as any[];
      const next = arr.includes(value)
        ? arr.filter((x) => x !== value)
        : [...arr, value];
      return { ...f, [key]: next };
    });
  };

  const reset = () => setFilters((f) => ({ ...emptyFilters, query: f.query }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink-900 dark:text-white md:text-4xl">
        Search restaurants
      </h1>
      <p className="mt-1 text-ink-500">
        Fuzzy search across names, cuisines, tags and areas — then refine.
      </p>

      <div className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <Input
            value={filters.query}
            onChange={(e) => {
              const q = e.target.value;
              setFilters((f) => ({ ...f, query: q }));
              router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
            }}
            placeholder="What are you craving?"
            className="pl-11"
            autoFocus
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="relative flex items-center gap-2 rounded-2xl border border-ink-200 px-4 text-sm font-medium text-ink-700 dark:border-ink-700 dark:text-ink-200"
        >
          <SlidersHorizontal size={16} /> Filters
          {count > 0 && (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-root-500 text-xs text-white">
              {count}
            </span>
          )}
        </button>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Filters panel */}
        <aside
          className={`${
            showFilters ? "block" : "hidden"
          } h-fit rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-ink-900 lg:block`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink-900 dark:text-white">Filters</h3>
            {count > 0 && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-xs text-root-600"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>

          <FilterGroup label="Area">
            {facets.areas.map((a) => (
              <Chip key={a} active={filters.areas.includes(a)} onClick={() => toggle("areas", a)}>
                {a}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Price">
            {PRICES.map((p) => (
              <Chip
                key={p}
                active={filters.prices.includes(p)}
                onClick={() => toggle("prices", p)}
              >
                {"$".repeat(p)}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Rating">
            {RATINGS.map((r) => (
              <Chip
                key={r}
                active={filters.minRating === r}
                onClick={() =>
                  setFilters((f) => ({ ...f, minRating: f.minRating === r ? 0 : r }))
                }
              >
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-saffron-500 text-saffron-500" /> {r}+
                </span>
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Availability">
            <Chip
              active={filters.openNow}
              onClick={() => setFilters((f) => ({ ...f, openNow: !f.openNow }))}
            >
              Open now
            </Chip>
          </FilterGroup>

          <FilterGroup label="Cuisine">
            {facets.cuisines.map((c) => (
              <Chip
                key={c}
                active={filters.cuisines.includes(c)}
                onClick={() => toggle("cuisines", c)}
              >
                {c}
              </Chip>
            ))}
          </FilterGroup>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-500">
              {loading ? "Searching…" : `${results.length} result${results.length === 1 ? "" : "s"}`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink-200 py-20 text-center dark:border-ink-700">
              <p className="text-lg font-semibold text-ink-700 dark:text-ink-200">
                No matches found
              </p>
              <p className="mt-1 text-ink-400">Try loosening your filters.</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 gap-4 md:grid-cols-3"
            >
              {results.map((r) => (
                <RestaurantCard key={r.id} r={r} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
