"use client";

import { useMemo, type ReactNode } from "react";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { useSiteSettings } from "@/app/lib/useSiteSettings";
import { useNow } from "@/app/lib/useClock";
import { daypartOf, openState, type Daypart } from "@/app/lib/clock";
import { popularDishes, cheapDishes } from "@/app/lib/dishes";
import { DishRail } from "./DishRail";
import { Hero } from "./Hero";
import { CategoryStrip } from "./CategoryStrip";
import { WheelSpinner } from "./WheelSpinner";
import { RestaurantRail } from "./RestaurantRail";
import { ReviewInvite } from "./ReviewInvite";
import { CompactList, FeaturedGrid, MenuList, OccasionRail } from "./HomeSections";
import { IftarSection } from "./IftarSection";

type Section =
  | "iftar"
  | "featured"
  | "popularDishes"
  | "wheel"
  | "cheapDishes"
  | "openNow"
  | "invite"
  | "occasion"
  | "recent";

/**
 * What the page leads with, by time of day. Each order keeps neighbouring
 * sections in different layouts (rail, grid, list, panel), so reordering
 * never stacks two of the same shape on top of each other.
 */
const ORDER: Record<Daypart, Section[]> = {
  morning: ["occasion", "featured", "openNow", "cheapDishes", "popularDishes", "wheel", "recent", "invite"],
  lunch: ["openNow", "featured", "popularDishes", "cheapDishes", "occasion", "wheel", "recent", "invite"],
  afternoon: ["featured", "occasion", "wheel", "cheapDishes", "popularDishes", "invite", "openNow", "recent"],
  evening: ["featured", "popularDishes", "wheel", "cheapDishes", "openNow", "invite", "occasion", "recent"],
  late: ["openNow", "featured", "wheel", "cheapDishes", "popularDishes", "invite", "occasion", "recent"],
  fasting: ["iftar", "featured", "popularDishes", "wheel", "cheapDishes", "openNow", "invite", "occasion", "recent"],
  iftar: ["iftar", "featured", "popularDishes", "wheel", "cheapDishes", "openNow", "invite", "occasion", "recent"],
  suhoor: ["openNow", "iftar", "featured", "wheel", "cheapDishes", "popularDishes", "invite", "occasion", "recent"],
};

/** Which occasion tab is up first. */
const OCCASION_FIRST: Record<Daypart, string> = {
  morning: "cafes",
  lunch: "fastFood",
  afternoon: "cafes",
  evening: "dateSpots",
  late: "fastFood",
  fasting: "dateSpots",
  iftar: "dateSpots",
  suhoor: "fastFood",
};

const OPEN_COPY: Partial<Record<Daypart, { title: string; subtitle: string }>> = {
  late: { title: "Still open late", subtitle: "Sorted by who closes last" },
  suhoor: { title: "Open for suhoor", subtitle: "Sorted by who closes last" },
};

export function HomeContent() {
  const { restaurants: all, loading } = useRestaurants();
  // Live, so hiding a listing in the admin console takes effect on open tabs
  // rather than waiting for a reload.
  const settings = useSiteSettings();
  // Null until mounted, so the pre-rendered page leads with the evening
  // layout and switches to the visitor's actual time of day on load.
  const now = useNow();
  const daypart: Daypart = now ? daypartOf(now, settings.ramadan) : "evening";

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
    const recent = [...restaurants].sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );
    return {
      byRating: pinnedFirst(byRating),
      featured: pinnedFirst(featured),
      fastFood,
      dateSpots,
      cafes,
      recent,
    };
  }, [restaurants, settings.pinned]);

  // Open places, with how long each has left. Late at night the useful order
  // is "who's open longest", so the list is sorted by closing time then.
  const openNow = useMemo(() => {
    if (!now) return [];
    const withState = restaurants
      .map((r) => ({ r, s: openState(r.hours, now) }))
      .filter((x) => x.s.kind === "open");
    if (daypart === "late" || daypart === "suhoor") {
      const left = (x: (typeof withState)[number]) =>
        x.s.kind === "open" ? x.s.closesInMin : 0;
      withState.sort((a, b) => left(b) - left(a));
    }
    return withState.map((x) => x.r);
  }, [restaurants, now, daypart]);

  const dishes = useMemo(
    () => ({
      popular: popularDishes(restaurants, 20),
      cheap: cheapDishes(restaurants, 20),
    }),
    [restaurants]
  );

  const railOn = (key: string) => settings.rails.includes(key);
  const openCopy = OPEN_COPY[daypart] ?? {
    title: "Open right now",
    subtitle: "Kitchens still running as of this minute",
  };

  const sections: Record<Section, ReactNode> = {
    iftar: settings.ramadan.enabled && now && (
      <IftarSection
        now={now}
        ramadan={settings.ramadan}
        restaurants={restaurants.filter((r) => r.iftar)}
      />
    ),

    featured: railOn("featured") && (
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
    ),

    popularDishes: railOn("popularDishes") && (
      <DishRail
        title="Dishes worth ordering"
        subtitle="What kitchens put their name to"
        dishes={dishes.popular}
        href="/explore?view=dishes"
      />
    ),

    wheel: settings.showWheel && (
      <div className="mt-12 md:mt-20">
        <WheelSpinner restaurants={restaurants} />
      </div>
    ),

    cheapDishes: railOn("cheapDishes") && (
      <MenuList
        title="Eat well for less"
        subtitle="The cheapest plates on any menu right now"
        dishes={dishes.cheap}
        href="/explore?view=dishes&sort=price-asc"
      />
    ),

    openNow: railOn("openNow") && (
      <RestaurantRail
        title={openCopy.title}
        subtitle={openCopy.subtitle}
        restaurants={openNow}
        href="/search"
      />
    ),

    invite: settings.showReviewInvite && <ReviewInvite restaurants={rails.byRating} />,

    // Three occasion rails share one row with tabs; each tab still follows
    // its own admin toggle. Keyed on the daypart so the first tab follows it.
    occasion: (
      <OccasionRail
        key={daypart}
        loading={loading}
        initial={OCCASION_FIRST[daypart]}
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
    ),

    recent: railOn("recent") && (
      <CompactList
        title="Recently added"
        subtitle="New on the list, not many reviews yet"
        restaurants={rails.recent}
        href="/explore"
      />
    ),
  };

  return (
    <>
      {settings.announcement && (
        <div className="mx-auto max-w-7xl px-5 pt-3 md:px-6">
          <p className="announce rounded-xl px-4 py-2.5 text-sm font-medium">
            {settings.announcement}
          </p>
        </div>
      )}

      <Hero restaurants={restaurants} daypart={now ? daypart : null} />

      {settings.showCategories && <CategoryStrip />}

      <main className="mx-auto max-w-7xl px-5 md:px-6">
        {ORDER[daypart].map((key) => (
          <div key={key} className="contents">
            {sections[key]}
          </div>
        ))}
      </main>
    </>
  );
}
