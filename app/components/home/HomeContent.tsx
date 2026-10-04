"use client";

import { useEffect, useMemo, useState } from "react";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { isOpenNow } from "@/app/lib/utils";
import {
  DEFAULT_SETTINGS,
  watchSiteSettings,
  type SiteSettings,
} from "@/app/lib/admin";
import { popularDishes, cheapDishes } from "@/app/lib/dishes";
import { DishRail } from "./DishRail";
import { Hero } from "./Hero";
import { CategoryStrip } from "./CategoryStrip";
import { WheelSpinner } from "./WheelSpinner";
import { RestaurantRail } from "./RestaurantRail";
import { ReviewInvite } from "./ReviewInvite";
import { CompactList, FeaturedGrid, MenuList, OccasionRail } from "./HomeSections";

export function HomeContent() {
  const { restaurants: all, loading } = useRestaurants();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Live, so hiding a listing in the admin console takes effect on open tabs
  // rather than waiting for a reload.
  useEffect(() => watchSiteSettings(setSettings), []);

  const restaurants = useMemo(
    () => all.filter((r) => !settings.hidden.includes(r.id)),
    [all, settings.hidden]
  );

  const rails = useMemo(() => {
    // Pinned listings lead the first rail, in the order the admin set them.
    const pinnedFirst = (xs: typeof restaurants) => {
      if (!settings.pinned.length) return xs;
      const rank = new Map(settings.pinned.map((id, i) => [id, i]));
      return [...xs].sort(
        (a, b) =>
          (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
          (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER)
      );
    };
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
    return {
      byRating: pinnedFirst(byRating),
      featured: pinnedFirst(featured),
      fastFood,
      dateSpots,
      cafes,
      openNow,
      recent,
    };
  }, [restaurants, settings.pinned]);

  const dishes = useMemo(
    () => ({
      popular: popularDishes(restaurants, 20),
      cheap: cheapDishes(restaurants, 20),
    }),
    [restaurants]
  );

  const railOn = (key: string) => settings.rails.includes(key);

  return (
    <>
      {settings.announcement && (
        <div className="mx-auto max-w-7xl px-5 pt-3 md:px-6">
          <p className="announce rounded-xl px-4 py-2.5 text-sm font-medium">
            {settings.announcement}
          </p>
        </div>
      )}

      <Hero restaurants={restaurants} />

      {settings.showCategories && (
        <div>
          <CategoryStrip />
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 md:px-6">
        {railOn("featured") && (
          <FeaturedGrid
            title="Worth the walk"
            subtitle="The ones we send people to first"
            // The lead grid has exactly five cells, so top up the picks with
            // the best-rated places rather than leave a hole in it.
            restaurants={[
              ...rails.featured,
              ...rails.byRating.filter((r) => !rails.featured.includes(r)),
            ]}
            loading={loading}
            href="/explore?sort=rating"
          />
        )}

        {/* Dishes sit high on the page on purpose: plenty of people arrive
            knowing what they want to eat before they know where. */}
        {railOn("popularDishes") && (
          <DishRail
            title="Dishes worth ordering"
            subtitle="What kitchens put their name to"
            dishes={dishes.popular}
            href="/explore?view=dishes"
          />
        )}

        {settings.showWheel && (
          <div className="mt-12 md:mt-20">
            <WheelSpinner restaurants={restaurants} />
          </div>
        )}

        {railOn("cheapDishes") && (
          <MenuList
            title="Eat well for less"
            subtitle="The cheapest plates on any menu right now"
            dishes={dishes.cheap}
            href="/explore?view=dishes&sort=price-asc"
          />
        )}

        {railOn("openNow") && (
          <RestaurantRail
            title="Open right now"
            subtitle="Kitchens still running as of this minute"
            restaurants={rails.openNow}
            loading={loading}
            href="/search"
          />
        )}

        {settings.showReviewInvite && <ReviewInvite restaurants={rails.byRating} />}

        {/* Three occasion rails share one row with tabs; each tab still
            follows its own admin toggle. */}
        <OccasionRail
          loading={loading}
          occasions={[
            {
              key: "dateSpots",
              label: "Date night",
              subtitle: "Quiet enough to hear each other",
              restaurants: rails.dateSpots,
              href: "/search?q=Date%20Spots",
            },
            {
              key: "cafes",
              label: "Coffee and breakfast",
              subtitle: "For mornings, and for working through them",
              restaurants: rails.cafes,
              href: "/search?q=Caf%C3%A9s",
            },
            {
              key: "fastFood",
              label: "In and out fast",
              subtitle: "When you just need feeding",
              restaurants: rails.fastFood,
              href: "/search?q=Fast%20food",
            },
          ].filter((o) => railOn(o.key))}
        />

        {railOn("recent") && (
          <CompactList
            title="Recently added"
            subtitle="New on the list, not many reviews yet"
            restaurants={rails.recent}
            href="/explore"
          />
        )}
      </main>
    </>
  );
}
