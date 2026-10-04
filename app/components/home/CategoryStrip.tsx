"use client";

import Link from "next/link";
import {
  Fish,
  Coffee,
  Pizza,
  Salad,
  Beef,
  Soup,
  IceCream,
  Heart,
} from "lucide-react";

/**
 * One neutral tile per category, with the icon carrying the brand colour. The
 * icon shapes already make the row scannable; giving each a different hue only
 * made the strip louder than the photos beneath it.
 */
const CATEGORIES = [
  { label: "Seafood", icon: Fish, q: "Seafood" },
  { label: "Cafés", icon: Coffee, q: "Cafés" },
  { label: "Fast Food", icon: Pizza, q: "Fast food" },
  { label: "Healthy", icon: Salad, q: "Healthy" },
  { label: "Grill", icon: Beef, q: "Grill" },
  { label: "Asian", icon: Soup, q: "Asian" },
  { label: "Desserts", icon: IceCream, q: "Bakery" },
  { label: "Date Spots", icon: Heart, q: "Date Spots" },
];

export function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-5 md:px-6">
      {/* Four across, two rows on a phone: eight tiles fit on one screen, so
          there's nothing to swipe past and nothing hidden off the edge. Wider
          screens lay all eight in one centred row. */}
      <div className="grid grid-cols-4 gap-2 md:flex md:gap-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.label}
            href={`/search?q=${encodeURIComponent(c.q)}`}
            className="surface press group flex flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-center md:min-w-[104px] md:flex-1 md:gap-2 md:py-4"
          >
            <c.icon
              size={22}
              strokeWidth={1.75}
              className="text-root-500 transition-transform duration-200 md:group-hover:-translate-y-0.5"
            />
            <span className="text-[11px] font-medium leading-tight text-ink-700 dark:text-ink-200 md:text-sm">
              {c.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
