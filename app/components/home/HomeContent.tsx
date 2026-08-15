"use client";

import { useEffect, useMemo, useState } from "react";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { isOpenNow } from "@/app/lib/utils";
import {
  DEFAULT_SETTINGS,
  watchSiteSettings,
  type SiteSettings,
} from "@/app/lib/admin";
import {
  Flame,
  Clock3,
  HeartHandshake,
  Coffee,
  Zap,
  Sparkle,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { popularDishes, cheapDishes } from "@/app/lib/dishes";
import { DishRail } from "./DishRail";
import { Hero } from "./Hero";
import { CategoryStrip } from "./CategoryStrip";
import { WheelSpinner } from "./WheelSpinner";
import { RestaurantRail } from "./RestaurantRail";
import { ReviewInvite } from "./ReviewInvite";

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
          <p className="clay-announce flex items-center justify-center gap-2.5 rounded-2xl px-4 py-2.5 text-center text-sm font-semibold">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--announce-accent)]"
            />
            {settings.announcement}
          </p>
        </div>
      )}

      <Hero restaurants={restaurants} />

      {settings.showCategories && (
        <div className="mt-2 md:mt-4">
          <CategoryStrip />
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 md:px-6">
        {railOn("featured") && (
          <RestaurantRail
            title="Worth the walk"
            icon={Flame}
            accent="root"
            subtitle="The ones we send people to first"
            restaurants={rails.featured.length ? rails.featured : rails.byRating}
            loading={loading}
            href="/explore?sort=rating"
          />
        )}

        {/* Dishes sit high on the page on purpose: plenty of people arrive
            knowing what they want to eat before they know where. */}
        {railOn("popularDishes") && (
          <DishRail
            title="Dishes worth ordering"
            icon={UtensilsCrossed}
            subtitle="What kitchens put their name to"
            dishes={dishes.popular}
            href="/explore?view=dishes"
          />
        )}

        {settings.showWheel && (
          <div className="mt-10 md:mt-14">
            <WheelSpinner restaurants={restaurants} />
          </div>
        )}

        {railOn("cheapDishes") && (
          <DishRail
            title="Eat well for less"
            icon={Wallet}
            accent="saffron"
            subtitle="The cheapest plates on any menu right now"
            dishes={dishes.cheap}
            href="/explore?view=dishes&sort=price-asc"
          />
        )}

        {railOn("openNow") && (
          <RestaurantRail
            title="Open right now"
            icon={Clock3}
            accent="emerald"
            subtitle="Kitchens still running as of this minute"
            restaurants={rails.openNow}
            loading={loading}
            href="/search"
          />
        )}

        {settings.showReviewInvite && <ReviewInvite restaurants={rails.byRating} />}

        {railOn("dateSpots") && (
          <RestaurantRail
            title="Good for a date"
            icon={HeartHandshake}
            accent="rose"
            subtitle="Quiet enough to hear each other"
            restaurants={rails.dateSpots}
            loading={loading}
            href="/search?q=Date%20Spots"
          />
        )}

        {railOn("cafes") && (
          <RestaurantRail
            title="Coffee and breakfast"
            icon={Coffee}
            accent="amber"
            subtitle="For mornings, and for working through them"
            restaurants={rails.cafes}
            loading={loading}
            href="/search?q=Caf%C3%A9s"
          />
        )}

        {railOn("fastFood") && (
          <RestaurantRail
            title="In and out in twenty minutes"
            icon={Zap}
            accent="sky"
            subtitle="When you just need feeding"
            restaurants={rails.fastFood}
            loading={loading}
            href="/search?q=Fast%20food"
          />
        )}

        {railOn("recent") && (
          <RestaurantRail
            title="Recently added"
            icon={Sparkle}
            accent="violet"
            restaurants={rails.recent}
            loading={loading}
            href="/explore"
          />
        )}
      </main>
    </>
  );
}
