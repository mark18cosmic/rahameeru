"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { useFavorites } from "@/app/lib/useFavorites";
import { RestaurantCard, CardSkeleton } from "./RestaurantCard";
import { ButtonLink } from "./ui/Button";

export function FavoritesContent() {
  const { restaurants, loading } = useRestaurants();
  const { favorites } = useFavorites();

  const saved = restaurants.filter((r) => favorites.includes(r.id));

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 md:px-6 md:py-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-root-500 text-white">
          <Heart size={20} className="fill-white" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white md:text-3xl">
            Your favorites
          </h1>
          <p className="text-sm text-ink-500 md:text-base">
            Places you&apos;ve saved for later.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-ink-200 px-4 py-14 text-center dark:border-ink-700 md:mt-10 md:py-20">
          <Heart size={40} className="mx-auto text-ink-300" />
          <p className="mt-4 text-lg font-semibold text-ink-700 dark:text-ink-200">
            No favorites yet
          </p>
          <p className="mt-1 text-ink-400">
            Tap the heart on any restaurant to save it here.
          </p>
          <ButtonLink href="/explore" className="mt-6">
            Explore restaurants
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-4">
          {saved.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
