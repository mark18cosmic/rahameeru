import Fuse from "fuse.js";
import type { Restaurant, PriceLevel } from "./types";
import { isOpenNow } from "./utils";

export interface SearchFilters {
  query: string;
  cuisines: string[];
  areas: string[];
  prices: PriceLevel[];
  minRating: number;
  openNow: boolean;
  tags: string[];
}

export const emptyFilters: SearchFilters = {
  query: "",
  cuisines: [],
  areas: [],
  prices: [],
  minRating: 0,
  openNow: false,
  tags: [],
};

export function buildFuse(restaurants: Restaurant[]) {
  return new Fuse(restaurants, {
    keys: [
      { name: "name", weight: 0.4 },
      { name: "cuisine", weight: 0.25 },
      { name: "tags", weight: 0.2 },
      { name: "location", weight: 0.1 },
      { name: "description", weight: 0.05 },
    ],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
}

export type SortKey = "relevance" | "rating" | "reviews" | "price-asc" | "price-desc";

export function runSearch(
  restaurants: Restaurant[],
  fuse: Fuse<Restaurant>,
  filters: SearchFilters,
  sort: SortKey = "relevance"
): Restaurant[] {
  let results: Restaurant[];

  const q = filters.query.trim();
  if (q) {
    results = fuse.search(q).map((r) => r.item);
  } else {
    results = [...restaurants];
  }

  results = results.filter((r) => {
    if (filters.cuisines.length && !r.cuisine.some((c) => filters.cuisines.includes(c)))
      return false;
    if (filters.areas.length && !filters.areas.includes(r.location)) return false;
    if (filters.prices.length && !filters.prices.includes(r.priceLevel)) return false;
    if (filters.minRating && r.rating < filters.minRating) return false;
    if (filters.openNow && !isOpenNow(r.hours)) return false;
    if (filters.tags.length && !r.tags.some((t) => filters.tags.includes(t)))
      return false;
    return true;
  });

  if (sort !== "relevance" || !q) {
    results = [...results].sort((a, b) => {
      switch (sort) {
        case "rating":
          return b.rating - a.rating;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        case "price-asc":
          return a.priceLevel - b.priceLevel;
        case "price-desc":
          return b.priceLevel - a.priceLevel;
        default:
          return q ? 0 : b.rating - a.rating;
      }
    });
  }

  return results;
}

export function facetsOf(restaurants: Restaurant[]) {
  const cuisines = new Set<string>();
  const areas = new Set<string>();
  const tags = new Set<string>();
  for (const r of restaurants) {
    r.cuisine.forEach((c) => cuisines.add(c));
    if (r.location) areas.add(r.location);
    r.tags.forEach((t) => tags.add(t));
  }
  return {
    cuisines: [...cuisines].sort(),
    areas: [...areas].sort(),
    tags: [...tags].sort(),
  };
}

export function activeFilterCount(f: SearchFilters): number {
  return (
    f.cuisines.length +
    f.areas.length +
    f.prices.length +
    f.tags.length +
    (f.minRating > 0 ? 1 : 0) +
    (f.openNow ? 1 : 0)
  );
}
