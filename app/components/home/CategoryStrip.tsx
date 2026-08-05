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
 * Each category carries its own colour. A strip of eight identical coral tiles
 * read as one block you scroll past; distinct hues make the row scannable and
 * give the home page colour beyond the brand red.
 */
const CATEGORIES = [
  { label: "Seafood", icon: Fish, q: "Seafood", tint: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300", hover: "group-hover:bg-sky-500" },
  { label: "Cafés", icon: Coffee, q: "Cafés", tint: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", hover: "group-hover:bg-amber-500" },
  { label: "Fast Food", icon: Pizza, q: "Fast food", tint: "bg-root-100 text-root-600 dark:bg-root-500/15 dark:text-root-300", hover: "group-hover:bg-root-500" },
  { label: "Healthy", icon: Salad, q: "Healthy", tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300", hover: "group-hover:bg-emerald-500" },
  { label: "Grill", icon: Beef, q: "Grill", tint: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300", hover: "group-hover:bg-orange-500" },
  { label: "Asian", icon: Soup, q: "Asian", tint: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300", hover: "group-hover:bg-violet-500" },
  { label: "Desserts", icon: IceCream, q: "Bakery", tint: "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300", hover: "group-hover:bg-pink-500" },
  { label: "Date Spots", icon: Heart, q: "Date Spots", tint: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300", hover: "group-hover:bg-rose-500" },
];

export function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-5 md:px-6">
      {/* Four across, two rows on a phone: eight tiles fit on one screen, so
          there's nothing to swipe past and nothing hidden off the edge. Wider
          screens lay all eight in one centred row. */}
      <div className="grid grid-cols-4 justify-center gap-2.5 md:flex md:flex-wrap md:gap-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.label}
            href={`/search?q=${encodeURIComponent(c.q)}`}
            className="group flex shrink-0 flex-col items-center justify-start gap-1.5 rounded-2xl border border-ink-100 bg-white px-1.5 py-3 text-center transition-all duration-200 active:scale-95 dark:border-ink-800 dark:bg-ink-900 md:min-w-[96px] md:gap-2 md:px-4 md:py-4 md:hover:-translate-y-1 md:hover:border-transparent md:hover:shadow-card"
          >
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all duration-200 md:h-12 md:w-12 md:group-hover:scale-110 md:group-hover:text-white ${c.tint} ${c.hover}`}
            >
              <c.icon size={19} className="md:hidden" />
              <c.icon size={21} className="hidden md:block" />
            </span>
            <span className="text-[11px] font-medium leading-tight text-ink-700 dark:text-ink-200 md:text-sm">
              {c.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
