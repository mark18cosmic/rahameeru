"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "rahameeru.favorites";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Lightweight favorites, persisted to localStorage and synced across tabs and
 * components via a storage event + custom event.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(read());
    const sync = () => setFavorites(read());
    window.addEventListener("storage", sync);
    window.addEventListener("favorites-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("favorites-changed", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("favorites-changed"));
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
