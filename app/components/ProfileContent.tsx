"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, LogOut } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useFavorites } from "@/app/lib/useFavorites";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { RestaurantCard } from "./RestaurantCard";
import { Button } from "./ui/Button";

export function ProfileContent() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { favorites } = useFavorites();
  const { restaurants } = useRestaurants();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="min-h-[60vh]" />;
  }

  const saved = restaurants.filter((r) => favorites.includes(r.id));
  const initial = (user.displayName?.[0] ?? user.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="flex flex-col items-start gap-5 rounded-3xl border border-ink-100 bg-white p-6 dark:border-ink-800 dark:bg-ink-900 sm:flex-row sm:items-center">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-root-500 text-3xl font-extrabold text-white">
          {initial}
        </span>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-extrabold text-ink-900 dark:text-white">
            {user.displayName ?? "Foodie"}
          </h1>
          <p className="text-ink-500">{user.email}</p>
          <div className="mt-3 flex gap-5 text-sm">
            <span className="flex items-center gap-1.5 text-ink-600 dark:text-ink-300">
              <Heart size={16} className="text-root-500" /> {saved.length} saved
            </span>
            <span className="flex items-center gap-1.5 text-ink-600 dark:text-ink-300">
              <Star size={16} className="text-saffron-500" /> Reviewer
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await logout();
            router.push("/");
          }}
        >
          <LogOut size={16} /> Log out
        </Button>
      </div>

      <h2 className="mt-10 font-display text-2xl font-extrabold text-ink-900 dark:text-white">
        Your favorites
      </h2>
      {saved.length === 0 ? (
        <p className="mt-3 text-ink-500">
          You haven&apos;t saved any restaurants yet.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {saved.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
