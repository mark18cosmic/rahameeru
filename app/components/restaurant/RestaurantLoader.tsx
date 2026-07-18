"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { Restaurant } from "@/app/lib/types";
import { getRestaurants } from "@/app/lib/restaurants";
import { slugify } from "@/app/lib/utils";
import { RestaurantDetail } from "./RestaurantDetail";

export function RestaurantLoader({ slug }: { slug: string }) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "found"; r: Restaurant; similar: Restaurant[] } | { status: "missing" }
  >({ status: "loading" });

  useEffect(() => {
    let alive = true;
    getRestaurants().then((all) => {
      if (!alive) return;
      const target = slug.toLowerCase();
      const r =
        all.find((x) => x.slug === target) ??
        all.find((x) => slugify(x.name) === target);
      if (!r) return setState({ status: "missing" });
      const similar = all
        .filter(
          (x) =>
            x.id !== r.id &&
            (x.cuisine.some((c) => r.cuisine.includes(c)) ||
              x.location === r.location)
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);
      setState({ status: "found", r, similar });
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="skeleton aspect-[16/9] rounded-3xl" />
        <div className="mt-6 space-y-3">
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
