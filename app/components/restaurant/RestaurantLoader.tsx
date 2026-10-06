"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { Restaurant } from "@/app/lib/types";
import {
  getRestaurants,
  getCachedRestaurants,
  getSeedRestaurants,
} from "@/app/lib/restaurants";
import { slugify, withSeason } from "@/app/lib/utils";
import { useSiteSettings } from "@/app/lib/useSiteSettings";
import { recordVisit } from "@/app/lib/metrics";
import { RestaurantSkeleton } from "../ui/Skeletons";
import { RestaurantDetail } from "./RestaurantDetail";

/**
 * Finds a restaurant in a list. `provisional` keeps the loading state when a
 * slug is missing from the bundled seed set — it may still exist in Firestore,
 * and a 404 is not something to show on a guess.
 */
function resolve(
  all: Restaurant[],
  slug: string,
  provisional: boolean
):
  | { status: "loading" }
  | { status: "found"; r: Restaurant; similar: Restaurant[] }
  | { status: "missing" } {
  const target = slug.toLowerCase();
  const r =
    all.find((x) => x.slug === target) ??
    all.find((x) => slugify(x.name) === target);
  if (!r) return provisional ? { status: "loading" } : { status: "missing" };

  const similar = all
    .filter(
      (x) =>
        x.id !== r.id &&
        (x.cuisine.some((c) => r.cuisine.includes(c)) || x.location === r.location)
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return { status: "found", r, similar };
}

export function RestaurantLoader({ slug }: { slug: string }) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "found"; r: Restaurant; similar: Restaurant[] } | { status: "missing" }
  >(() => resolve(getCachedRestaurants() ?? getSeedRestaurants(), slug, true));

  useEffect(() => {
    let alive = true;
    getRestaurants().then((all) => {
      if (!alive) return;
      const next = resolve(all, slug, false);
      setState(next);
      // Feeds the vendor dashboard. Once per restaurant per session.
      if (next.status === "found") recordVisit(next.r.id);
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state.status === "loading") return <RestaurantSkeleton />;

  if (state.status === "missing") {
    notFound();
  }

  return <SeasonalDetail restaurant={state.r} similar={state.similar} />;
}

/** Applies Ramadan hours, so the page's hours table and badge follow the mode. */
function SeasonalDetail({ restaurant, similar }: { restaurant: Restaurant; similar: Restaurant[] }) {
  const { ramadan } = useSiteSettings();
  const [r] = withSeason([restaurant], ramadan);
  return (
    <RestaurantDetail restaurant={r} similar={withSeason(similar, ramadan)} />
  );
}
