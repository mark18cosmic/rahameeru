import type { MenuItem, Restaurant } from "./types";

/**
 * Dishes, flattened across every restaurant.
 *
 * People don't only decide where to eat — they decide what to eat, and then
 * where that is. The menus already exist on each listing; this turns them into
 * a list you can rank, filter and search on its own terms.
 */
export type DishEntry = {
  /** Stable across renders: a dish is identified by its venue and its name. */
  id: string;
  item: MenuItem;
  section: string;
  restaurant: Restaurant;
};

export function allDishes(restaurants: Restaurant[]): DishEntry[] {
  const out: DishEntry[] = [];
  for (const r of restaurants) {
    for (const section of r.menu ?? []) {
      for (const item of section.items) {
        if (!item.name?.trim()) continue;
        out.push({
          id: `${r.id}:${item.name.trim().toLowerCase()}`,
          item,
          section: section.name,
          restaurant: r,
        });
      }
    }
  }
  return out;
}

/**
 * Ranking without per-dish review data.
 *
 * Dish-level ratings exist, but only per restaurant and only after fetching
 * that venue's reviews — doing that for every listing to build one rail would
 * cost a request per restaurant. So the order leans on what the menus already
 * declare: the kitchen's own "popular" flag first, then the venue's rating,
 * which is the best available proxy for whether the dish is worth ordering.
 */
export function rankDishes(entries: DishEntry[]): DishEntry[] {
  return [...entries].sort((a, b) => {
    const pop = Number(Boolean(b.item.popular)) - Number(Boolean(a.item.popular));
    if (pop) return pop;
    return b.restaurant.rating - a.restaurant.rating;
  });
}

/** Popular picks only, best venue first. Used for the home page rail. */
export function popularDishes(restaurants: Restaurant[], limit = 20): DishEntry[] {
  const popular = allDishes(restaurants).filter((d) => d.item.popular);
  return rankDishes(popular).slice(0, limit);
}

/** Cheapest first, for the "eat well for less" angle. */
export function cheapDishes(restaurants: Restaurant[], limit = 20): DishEntry[] {
  return allDishes(restaurants)
    .filter((d) => d.item.price > 0)
    .sort((a, b) => a.item.price - b.item.price)
    .slice(0, limit);
}

/** Free-text match over dish name, description, tags and the venue. */
export function searchDishes(
  entries: DishEntry[],
  term: string
): DishEntry[] {
  const q = term.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((d) =>
    `${d.item.name} ${d.item.description ?? ""} ${(d.item.tags ?? []).join(" ")} ${
      d.restaurant.name
    } ${d.section}`
      .toLowerCase()
      .includes(q)
  );
}

/** Every distinct dish tag in the set, for filter chips. */
export function dishTags(entries: DishEntry[]): string[] {
  const seen = new Set<string>();
  for (const d of entries) for (const t of d.item.tags ?? []) seen.add(t);
  return Array.from(seen).sort();
}
