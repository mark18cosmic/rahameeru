"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/app/lib/useFavorites";
import { cx } from "@/app/lib/utils";

export function FavoriteButton({
  id,
  className,
  size = 18,
}: {
  id: string;
  className?: string;
  size?: number;
}) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      className={cx(
        "grid place-items-center rounded-full backdrop-blur transition active:scale-90",
        active
          ? "bg-root-500 text-white"
          : "bg-white/80 text-ink-600 hover:bg-white dark:bg-ink-800/80 dark:text-ink-200",
        className
      )}
    >
      <Heart size={size} className={active ? "fill-white" : ""} />
    </button>
  );
}
