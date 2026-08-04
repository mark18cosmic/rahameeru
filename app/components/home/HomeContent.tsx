"use client";

import { useMemo } from "react";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { isOpenNow } from "@/app/lib/utils";
import { Hero } from "./Hero";
import { CategoryStrip } from "./CategoryStrip";
import { WheelSpinner } from "./WheelSpinner";
import { RestaurantRail } from "./RestaurantRail";

export function HomeContent() {
  const { restaurants, loading } = useRestaurants();

  const rails = useMemo(() => {
    const byRating = [...restaurants].sort((a, b) => b.rating - a.rating);
    const featured = restaurants.filter((r) => r.featured);
    const fastFood = restaurants.filter((r) =>
      r.tags.includes("Fast food") || r.cuisine.includes("Fast Food")
    );
    const dateSpots = restaurants.filter((r) => r.tags.includes("Date Spots"));
    const cafes = restaurants.filter(
      (r) => r.cuisine.includes("Café") || r.tags.includes("Cafés")
    );
    const openNow = restaurants.filter((r) => isOpenNow(r.hours));
    const recent = [...restaurants].sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );
    return { byRating, featured, fastFood, dateSpots, cafes, openNow, recent };
  }, [restaurants]);

  return (
    <>
      <Hero restaurants={restaurants} />

      <div className="mt-4">
        <CategoryStrip />
      </div>

      <main className="mx-auto max-w-7xl px-4 md:px-6">
        <RestaurantRail
          title="Worth the walk"
          subtitle="The ones we send people to first"
          restaurants={rails.featured.length ? rails.featured : rails.byRating}
          loading={loading}
          href="/explore?sort=rating"
        />

        <div className="mt-14">
          <WheelSpinner restaurants={restaurants} />
        </div>

        <RestaurantRail
          title="Open right now"
          subtitle="Kitchens still running as of this minute"
          restaurants={rails.openNow}
          loading={loading}
          href="/search"
        />

        <RestaurantRail
          title="Good for a date"
          subtitle="Quiet enough to hear each other"
          restaurants={rails.dateSpots}
          loading={loading}
          href="/search?q=Date%20Spots"
        />

        <RestaurantRail
          title="Coffee and breakfast"
          subtitle="For mornings, and for working through them"
          restaurants={rails.cafes}
          loading={loading}
          href="/search?q=Caf%C3%A9s"
        />

        <RestaurantRail
          title="In and out in twenty minutes"
          subtitle="When you just need feeding"
          restaurants={rails.fastFood}
          loading={loading}
          href="/search?q=Fast%20food"
        />

        <RestaurantRail
          title="Recently added"
          restaurants={rails.recent}
          loading={loading}
          href="/explore"
        />
      </main>
    </>
  );
}
