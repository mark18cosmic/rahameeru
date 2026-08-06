"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { Restaurant } from "@/app/lib/types";
import {
  getRestaurants,
  getCachedRestaurants,
  getSeedRestaurants,
} from "@/app/lib/restaurants";
import { slugify } from "@/app/lib/utils";
import { recordVisit } from "@/app/lib/metrics";
import { ChiliLoader } from "../ui/ChiliLoader";
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

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <ChiliLoader label="Setting the table…" className="py-16" />
        <div className="mt-2 space-y-3 opacity-60">
          <div className="skeleton h-8 w-1/2 rounded" />
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (state.status === "missing") {
    notFound();
  }

  return <RestaurantDetail restaurant={state.r} similar={state.similar} />;
}
