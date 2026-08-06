"use client";

import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Star, Flame, Leaf, ShieldAlert, UtensilsCrossed, Plus, Check } from "lucide-react";
import type { MenuItem } from "@/app/lib/types";
import { dishPhotoUrl, cx } from "@/app/lib/utils";
import { flagsFor, flagLabel, DIET_BY_KEY, type DietKey } from "@/app/lib/diet";
import { useCart } from "@/app/lib/useCart";
import { BLUR } from "../ui/Photo";

/** Ingredient words worth surfacing when the restaurant hasn't listed any. */
const KNOWN = Array.from(
  new Set(
    Object.values(DIET_BY_KEY)
      .flatMap((o) => o.contains)
      .filter((w) => w.length > 3)
  )
);

/**
 * What we can say about a dish's ingredients when nobody has listed them:
 * the words the menu itself used. Presented as "mentioned on the menu" rather
 * than as an ingredient list, because that is all it is.
 */
function mentionedIngredients(item: MenuItem): string[] {
  const text = `${item.name} ${item.description ?? ""}`.toLowerCase();
  const found = KNOWN.filter((w) =>
    new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(text)
  );
  // Longest first, then de-duplicate overlaps like "ice cream" / "cream".
  found.sort((a, b) => b.length - a.length);
  const kept: string[] = [];
  for (const w of found) {
    if (!kept.some((k) => k.includes(w))) kept.push(w);
  }
  return kept.slice(0, 8);
}

function formatPrice(mvr: number): string {
  return `MVR ${mvr.toLocaleString()}`;
}

export function DishSheet({
  item,
  restaurantId,
  restaurantName,
  restaurantSlug,
  cuisine,
  diet,
  score,
  onClose,
}: {
  item: MenuItem | null;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  cuisine: string[];
  diet: DietKey[];
  /** What reviewers gave this dish, if anyone has rated it. */
  score?: { average: number; count: number };
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const { add, items } = useCart();
  const inBill = item
    ? items.find(
        (i) =>
          i.restaurantId === restaurantId &&
          i.dish.toLowerCase() === item.name.toLowerCase()
      )?.qty ?? 0
    : 0;
  const flags = item ? flagsFor(item, diet) : [];
  const listed = item?.ingredients ?? [];
  const spotted = item && listed.length === 0 ? mentionedIngredients(item) : [];

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-900/60" onClick={onClose} />

          {/* Sheet on a phone, dialog on a desktop — the same content either way. */}
          <motion.div
            role="dialog"
            aria-label={item.name}
            initial={reduceMotion ? false : { y: "8%", opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { y: "6%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            drag={reduceMotion ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => info.offset.y > 90 && onClose()}
            className="relative max-h-[88svh] w-full overflow-y-auto rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] dark:bg-ink-900 sm:max-w-lg sm:rounded-3xl sm:pb-0"
          >
            <div className="relative h-48 overflow-hidden rounded-t-3xl bg-ink-100 dark:bg-ink-800 sm:h-56">
              <Image
                src={item.image ?? dishPhotoUrl(item.name, restaurantName, cuisine)}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 512px"
                placeholder="blur"
                blurDataURL={BLUR}
                className="object-cover"
              />
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-ink-700 shadow-sm ring-1 ring-black/5 active:scale-90 dark:bg-ink-900 dark:text-ink-100"
              >
                <X size={18} />
              </button>
              {/* Grab handle, phone only — it's a draggable sheet there. */}
              <span
                aria-hidden
                className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70 sm:hidden"
              />
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
                  {item.name}
                </h3>
                <span className="shrink-0 whitespace-nowrap font-bold tabular-nums text-ink-900 dark:text-white">
                  {formatPrice(item.price)}
                </span>
              </div>

              {score && (
                <p className="mt-2 flex items-center gap-1.5 text-sm">
                  <Star size={15} className="fill-saffron-500 text-saffron-500" />
                  <b className="text-ink-900 dark:text-white">
                    {score.average.toFixed(1)}
                  </b>
                  <span className="text-ink-500">
                    from {score.count} {score.count === 1 ? "person" : "people"} who
                    ordered it
                  </span>
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.popular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-saffron-400/20 px-2 py-1 text-[11px] font-semibold text-saffron-500">
                    <Star size={11} className="fill-saffron-500" /> Popular
                  </span>
                )}
                {item.tags?.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-1 text-[11px] font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-300"
                  >
                    {t.toLowerCase() === "spicy" && <Flame size={11} />}
                    {(t.toLowerCase() === "vegetarian" || t.toLowerCase() === "vegan") && (
                      <Leaf size={11} />
                    )}
                    {t}
                  </span>
                ))}
              </div>

              {item.description && (
                <p className="mt-3 leading-relaxed text-ink-600 dark:text-ink-300">
                  {item.description}
                </p>
              )}

              {flags.length > 0 && (
                <div className="mt-4 rounded-2xl bg-root-50 p-3.5 dark:bg-root-900/20">
                  <p className="flex items-start gap-2 text-sm font-semibold text-root-700 dark:text-root-300">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                    {flagLabel(flags)}
                  </p>
                  <p className="mt-1 pl-6 text-xs text-root-700/80 dark:text-root-300/80">
                    Based on how the dish is described, not on what the kitchen
                    told us. Check with the restaurant before ordering.
                  </p>
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {listed.length ? "Ingredients" : "Mentioned on the menu"}
                </p>
                {listed.length || spotted.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(listed.length ? listed : spotted).map((w) => (
                      <span
                        key={w}
                        className={cx(
                          "rounded-full px-2.5 py-1 text-xs capitalize",
                          "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200"
                        )}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 flex items-center gap-2 text-sm text-ink-400">
                    <UtensilsCrossed size={14} />
                    The restaurant hasn&apos;t listed any — ask when you order.
                  </p>
                )}
                {!listed.length && spotted.length > 0 && (
                  <p className="mt-2 text-xs text-ink-400">
                    Picked out of the dish name and description, so it won&apos;t
                    be the full list.
                  </p>
                )}
              </div>

              {/* Adds to the running bill in the header — nothing is ordered. */}
              <button
                onClick={() =>
                  add({
                    restaurantId,
                    restaurantName,
                    restaurantSlug,
                    dish: item.name,
                    price: item.price,
                  })
                }
                className="mt-5 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-root-500 font-semibold text-white transition hover:bg-root-600 active:scale-[0.98]"
              >
                {inBill > 0 ? (
                  <>
                    <Check size={17} /> In your bill ({inBill}) · add another
                  </>
                ) : (
                  <>
                    <Plus size={17} /> Add to bill · {formatPrice(item.price)}
                  </>
                )}
              </button>
              <p className="mt-1.5 text-center text-[11px] text-ink-400">
                Works out what an evening costs. It doesn&apos;t order anything.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
