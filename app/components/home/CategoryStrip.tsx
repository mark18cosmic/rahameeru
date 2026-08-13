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
  { label: "Seafood", icon: Fish, q: "Seafood", tint: "from-sky-400 to-sky-600" },
  { label: "Cafés", icon: Coffee, q: "Cafés", tint: "from-amber-400 to-amber-600" },
  { label: "Fast Food", icon: Pizza, q: "Fast food", tint: "from-root-400 to-root-600" },
  { label: "Healthy", icon: Salad, q: "Healthy", tint: "from-emerald-400 to-emerald-600" },
  { label: "Grill", icon: Beef, q: "Grill", tint: "from-orange-400 to-orange-600" },
  { label: "Asian", icon: Soup, q: "Asian", tint: "from-violet-400 to-violet-600" },
  { label: "Desserts", icon: IceCream, q: "Bakery", tint: "from-pink-400 to-pink-600" },
  { label: "Date Spots", icon: Heart, q: "Date Spots", tint: "from-rose-400 to-rose-600" },
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
            className="clay clay-press group flex shrink-0 flex-col items-center justify-start gap-1.5 rounded-[1.5rem] px-1.5 py-3 text-center md:min-w-[96px] md:gap-2 md:px-4 md:py-4"
          >
            <span
              className={`clay-on-color grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white transition-transform duration-200 md:h-12 md:w-12 md:group-hover:scale-110 ${c.tint}`}
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
