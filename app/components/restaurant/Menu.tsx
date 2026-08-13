"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  Flame,
  Leaf,
  Star,
  X,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  UtensilsCrossed,
} from "lucide-react";
import type { MenuItem, MenuSection } from "@/app/lib/types";
import { cx, dishPhotoUrl } from "@/app/lib/utils";
import { flagsFor } from "@/app/lib/diet";
import { usePreferences } from "@/app/lib/usePreferences";
import { useReviews } from "@/app/lib/useReviews";
import { BLUR } from "../ui/Photo";
import { DishSheet } from "./DishSheet";

/** Dietary filters, matched against an item's `tags`. */
const FILTERS = [
  { key: "Popular", label: "Popular", icon: Star, match: [] },
  { key: "Vegetarian", label: "Veg", icon: Leaf, match: ["Vegetarian", "Vegan"] },
  { key: "Vegan", label: "Vegan", icon: Leaf, match: ["Vegan"] },
  { key: "Spicy", label: "Spicy", icon: Flame, match: ["Spicy"] },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function formatPrice(mvr: number): string {
  return `MVR ${mvr.toLocaleString()}`;
}

/**
 * The menu is a single-open accordion rather than one long scroll.
 *
 * A full menu can run to a hundred dishes across a dozen sections; listing it
 * flat meant scrolling past everything to reach the desserts, and the old jump
 * bar just traded scrolling for aiming at a small target. Collapsed sections
 * put the whole menu on one screen, so choosing a course is a single tap.
 * Searching or filtering bypasses the accordion entirely — the matches are the
 * point, so they are shown expanded.
 */
export function Menu({
  sections,
  restaurantId,
  restaurantName,
  restaurantSlug,
  cuisine = [],
  initialDish,
}: {
  sections: MenuSection[];
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  cuisine?: string[];
  /** Dish name to open on mount, from a ?dish= link on a dish card. */
  initialDish?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterKey[]>([]);
  const [dish, setDish] = useState<MenuItem | null>(
    // Resolved once, on mount: someone arriving from a dish card should land
    // with that dish already open rather than having to find it again.
    () =>
      initialDish
        ? sections
            .flatMap((s) => s.items)
            .find(
              (i) => i.name.trim().toLowerCase() === initialDish.trim().toLowerCase()
            ) ?? null
        : null
  );
  const [openSection, setOpenSection] = useState(
    () =>
      (initialDish
        ? sections.find((s) =>
            s.items.some(
              (i) => i.name.trim().toLowerCase() === initialDish.trim().toLowerCase()
            )
          )?.name
        : undefined) ??
      sections[0]?.name ??
      ""
  );
  const [onlySuitable, setOnlySuitable] = useState(false);
  const reduceMotion = useReducedMotion();
  const { diet } = usePreferences();
  // Dish scores come from what reviewers said they ordered.
  const { dishes: dishRatings } = useReviews(restaurantId);

  const toggleFilter = (key: FilterKey) =>
    setFilters((f) => (f.includes(key) ? f.filter((x) => x !== key) : [...f, key]));

  /** Sections with items filtered down; empty sections are dropped. */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (onlySuitable && flagsFor(item, diet).length > 0) return false;
          if (q) {
            const haystack = `${item.name} ${item.description ?? ""}`.toLowerCase();
            if (!haystack.includes(q)) return false;
          }
          // All active filters must hold — narrowing, not widening.
          return filters.every((key) => {
            if (key === "Popular") return item.popular;
            const spec = FILTERS.find((f) => f.key === key);
            return spec?.match.some((m) => item.tags?.includes(m)) ?? false;
          });
        }),
      }))
      .filter((s) => s.items.length > 0);
  }, [sections, query, filters, diet, onlySuitable]);

  const total = visible.reduce((n, s) => n + s.items.length, 0);
  const filtering = Boolean(query.trim()) || filters.length > 0 || onlySuitable;

  // How much of the menu a person with allergens set can actually eat.
  const suitable = useMemo(() => {
    if (diet.length === 0) return null;
    const all = sections.flatMap((s) => s.items);
    return {
      fits: all.filter((i) => flagsFor(i, diet).length === 0).length,
      total: all.length,
    };
  }, [sections, diet]);

  const clear = () => {
    setQuery("");
    setFilters([]);
    setOnlySuitable(false);
  };

  return (
    <section id="menu" className="scroll-mt-24">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white md:text-3xl">
          Menu
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Prices are a guide and change often — check with the restaurant.
        </p>
      </div>

      {/* Search + dietary filters */}
      <div className="mt-5 space-y-3">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the menu…"
            aria-label="Search the menu"
            className="clay-inset min-h-[48px] w-full rounded-2xl py-3 pl-11 pr-11 text-base text-ink-900 outline-none transition placeholder:text-ink-400 focus:ring-2 focus:ring-root-200 dark:text-white dark:focus:ring-root-900/50"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => {
            const on = filters.includes(f.key);
            return (
              <button
                key={f.key}
                onClick={() => toggleFilter(f.key)}
                aria-pressed={on}
                className={cx(
                  "inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition",
                  on
                    ? "clay-root"
                    : "clay-sm clay-press text-ink-600 dark:text-ink-300"
                )}
              >
                <f.icon size={15} className={on ? "fill-white/30" : ""} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {suitable && (
        <button
          onClick={() => setOnlySuitable((v) => !v)}
          aria-pressed={onlySuitable}
          className={cx(
            "mt-3 flex w-full items-center gap-2.5 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99]",
            onlySuitable
              ? "border-root-500 bg-root-50 dark:bg-root-900/20"
              : "border-ink-200 dark:border-ink-700"
          )}
        >
          <ShieldAlert size={17} className="shrink-0 text-root-500" />
          <span className="min-w-0 flex-1 text-sm">
            <span className="font-semibold text-ink-900 dark:text-white">
              {suitable.fits} of {suitable.total} dishes suit your profile
            </span>
            <span className="block text-xs text-ink-500">
              {onlySuitable ? "Showing only these" : "Tap to hide the rest"}
            </span>
          </span>
          <span
            className={cx(
              "relative h-6 w-10 shrink-0 rounded-full transition-colors",
              onlySuitable ? "bg-root-500" : "bg-ink-200 dark:bg-ink-700"
            )}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className={cx(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm",
                onlySuitable ? "left-[1.125rem]" : "left-0.5"
              )}
            />
          </span>
        </button>
      )}

      {filtering && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-500" aria-live="polite">
            {total} {total === 1 ? "dish" : "dishes"} match
          </p>
          <button
            onClick={clear}
            className="text-sm font-semibold text-root-600 transition hover:text-root-700"
          >
            Clear
          </button>
        </div>
      )}

      {/* Accordion */}
      <div
        className={cx(
          "mt-4 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 dark:divide-ink-800 dark:border-ink-800",
          visible.length === 0 && "hidden"
        )}
      >
        {visible.map((section) => {
          const expanded = filtering || openSection === section.name;
          const panelId = `menu-panel-${section.name.replace(/\W+/g, "-")}`;
          return (
            <div key={section.name}>
              <button
                onClick={() =>
                  // While filtering every section is already open, so the header
                  // is inert rather than misleadingly clickable-with-no-effect.
                  !filtering &&
                  setOpenSection((s) => (s === section.name ? "" : section.name))
                }
                aria-expanded={expanded}
                aria-controls={panelId}
                disabled={filtering}
                className={cx(
                  "flex min-h-[56px] w-full items-center gap-3 px-4 text-left transition",
                  !filtering && "hover:bg-ink-50 dark:hover:bg-ink-800/60",
                  expanded && "bg-ink-50/60 dark:bg-ink-800/40"
                )}
              >
                <span className="flex-1 font-display font-bold text-ink-900 dark:text-white">
                  {section.name}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-ink-400">
                  {section.items.length}
                </span>
                {!filtering && (
                  <ChevronDown
                    size={18}
                    className={cx(
                      "shrink-0 text-ink-400 transition-transform duration-200",
                      expanded && "rotate-180"
                    )}
                  />
                )}
              </button>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    id={panelId}
                    key="panel"
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <ul className="divide-y divide-ink-100 px-3 dark:divide-ink-800 md:px-4">
                      {section.items.map((item) => {
                        const flags = flagsFor(item, diet);
                        const score = dishRatings.get(item.name.trim().toLowerCase());
                        return (
                          <li key={item.name}>
                            <button
                              onClick={() => setDish(item)}
                              className="flex w-full items-center gap-3 py-3 text-left transition active:scale-[0.99]"
                            >
                              {/* Thumbnail, looked up by dish name. Lazy, so a
                                  60-dish menu doesn't fetch 60 photos at once. */}
                              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                                <Image
                                  src={
                                    item.image ??
                                    dishPhotoUrl(item.name, restaurantName, cuisine)
                                  }
                                  alt=""
                                  fill
                                  sizes="64px"
                                  loading="lazy"
                                  placeholder="blur"
                                  blurDataURL={BLUR}
                                  className="object-cover"
                                />
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-ink-900 dark:text-white">
                                    {item.name}
                                  </span>
                                  {item.popular && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-saffron-400/20 px-2 py-0.5 text-[11px] font-semibold text-saffron-500">
                                      <Star size={10} className="fill-saffron-500" />
                                      Popular
                                    </span>
                                  )}
                                </span>
                                {item.description && (
                                  <span className="mt-0.5 line-clamp-2 block text-sm text-ink-500">
                                    {item.description}
                                  </span>
                                )}
                                <span className="mt-1 flex flex-wrap items-center gap-1.5">
                                  {score && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-saffron-400/20 px-2 py-0.5 text-[11px] font-bold text-saffron-500">
                                      <Star size={10} className="fill-saffron-500" />
                                      {score.average.toFixed(1)}
                                      <span className="font-medium text-ink-400">
                                        ({score.count})
                                      </span>
                                    </span>
                                  )}
                                  {flags.length > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-root-50 px-2 py-0.5 text-[11px] font-semibold text-root-700 dark:bg-root-900/25 dark:text-root-300">
                                      <ShieldAlert size={10} /> Check ingredients
                                    </span>
                                  )}
                                  {item.tags?.map((t) => (
                                    <span
                                      key={t}
                                      className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] text-ink-600 dark:bg-ink-800 dark:text-ink-300"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </span>
                              </span>

                              <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold tabular-nums text-ink-800 dark:text-ink-100">
                                {formatPrice(item.price)}
                                <ChevronRight size={15} className="text-ink-300" />
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-200 py-12 text-center dark:border-ink-700">
          <UtensilsCrossed className="mx-auto text-ink-300" size={28} />
          <p className="mt-3 font-medium text-ink-700 dark:text-ink-200">
            Nothing on the menu matches
          </p>
          <p className="mt-1 text-sm text-ink-500">Try a different word or clear the filters.</p>
          <button
            onClick={clear}
            className="clay-sm clay-press mt-4 min-h-[44px] rounded-full px-5 text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      <DishSheet
        item={dish}
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
        cuisine={cuisine}
        diet={diet}
        score={dish ? dishRatings.get(dish.name.trim().toLowerCase()) : undefined}
        onClose={() => setDish(null)}
      />
    </section>
  );
}
