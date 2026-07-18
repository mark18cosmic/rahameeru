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
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.label}
            href={`/search?q=${encodeURIComponent(c.q)}`}
            className="group flex min-w-[92px] flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white px-4 py-4 transition hover:-translate-y-1 hover:border-root-200 hover:shadow-soft dark:border-ink-800 dark:bg-ink-900"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-root-50 text-root-500 transition group-hover:bg-root-500 group-hover:text-white dark:bg-ink-800">
              <c.icon size={22} />
            </span>
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">
              {c.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
