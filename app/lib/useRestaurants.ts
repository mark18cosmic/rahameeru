"use client";

import { useEffect, useState } from "react";
import type { Restaurant } from "./types";
import { getRestaurants } from "./restaurants";

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

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
