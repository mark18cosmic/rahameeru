"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Review } from "./types";
import { getReviews, dishStats } from "./reviews";

const EVENT = "reviews-changed";

/** Keyed by restaurant so the menu and the review list share one fetch. */
const cache = new Map<string, Review[]>();

/**
 * Reviews for one restaurant, plus the dish ratings derived from them.
 *
 * Both the menu and the review tab need this data, and they are rendered on the
 * same page — without a shared cache the page would fetch the same collection
 * twice and the two views could disagree about what people rated.
 */
export function useReviews(restaurantId: string) {
  const [reviews, setReviews] = useState<Review[]>(
    () => cache.get(restaurantId) ?? []
  );
  const [loading, setLoading] = useState(() => !cache.has(restaurantId));

  const load = useCallback(async () => {
    const data = await getReviews(restaurantId);
    cache.set(restaurantId, data);
    setReviews(data);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    let alive = true;
    const run = () => {
      if (!alive) return;
      load();
    };
    run();
    window.addEventListener(EVENT, run);
    return () => {
      alive = false;
      window.removeEventListener(EVENT, run);
    };
  }, [load]);

  const dishes = useMemo(() => dishStats(reviews), [reviews]);

  /** Call after posting: drops the cache and refetches every listener. */
  const refresh = useCallback(() => {
    cache.delete(restaurantId);
    window.dispatchEvent(new Event(EVENT));
  }, [restaurantId]);

  return { reviews, dishes, loading, refresh };
}
