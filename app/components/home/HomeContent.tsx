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
      <Hero />

      <div className="mt-4">
        <CategoryStrip />
      </div>

      <main className="mx-auto max-w-7xl px-4 md:px-6">
        <RestaurantRail
          title="Featured restaurants"
          subtitle="Handpicked spots worth the trip"
          restaurants={rails.featured.length ? rails.featured : rails.byRating}
          loading={loading}
          href="/explore?sort=rating"
        />

        <div className="mt-14">
          <WheelSpinner restaurants={restaurants} />
        </div>

        <RestaurantRail
          title="Open right now"
          subtitle="Grab a bite this minute"
          restaurants={rails.openNow}
          loading={loading}
          href="/search"
        />

        <RestaurantRail
          title="Perfect date spots"
          subtitle="Set the mood for something special"
          restaurants={rails.dateSpots}
          loading={loading}
          href="/search?q=Date%20Spots"
        />

        <RestaurantRail
          title="Cafés & brunch"
          subtitle="Coffee, pastries and slow mornings"
          restaurants={rails.cafes}
          loading={loading}
          href="/search?q=Caf%C3%A9s"
        />

        <RestaurantRail
          title="Quick & casual"
          subtitle="Fast food done right"
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
