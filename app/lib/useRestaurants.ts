"use client";

import { useEffect, useState } from "react";
import type { Restaurant } from "./types";
import {
  getRestaurants,
  getCachedRestaurants,
  getSeedRestaurants,
} from "./restaurants";

/**
 * Restaurants, rendered immediately and corrected in the background.
 *
 * Waiting on Firestore before showing anything meant every page opened as a
 * grid of skeletons, even though a full copy of the data ships in the bundle.
 * So the first render uses whatever is already in memory — the cached list if
 * another page has loaded it, the bundled seed set otherwise — and the merged
 * result replaces it when the network answers.
 *
 * `loading` now means "still reconciling", not "nothing to show", so callers
 * should keep rendering rather than swap in a spinner.
 */
export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(
    () => getCachedRestaurants() ?? getSeedRestaurants()
  );
  const [loading, setLoading] = useState(() => getCachedRestaurants() === null);

  useEffect(() => {
    let alive = true;
    getRestaurants()
      .then((data) => alive && setRestaurants(data))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { restaurants, loading };
}
