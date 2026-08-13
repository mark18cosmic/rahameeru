"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, LogOut } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useFavorites } from "@/app/lib/useFavorites";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { RestaurantCard } from "./RestaurantCard";
import { DietPicker } from "./profile/DietPicker";
import { RewardsCard } from "./profile/RewardsCard";
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
    <div className="mx-auto max-w-5xl px-5 py-6 md:px-6 md:py-10">
      <div className="clay flex flex-col items-start gap-4 rounded-[2rem] p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
        <span className="clay-root grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl font-extrabold sm:h-20 sm:w-20 sm:rounded-[1.75rem] sm:text-3xl">
          {initial}
        </span>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white sm:text-3xl">
            {user.displayName ?? "Foodie"}
          </h1>
          <p className="truncate text-sm text-ink-500 sm:text-base">{user.email}</p>
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

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <RewardsCard />
        <DietPicker />
      </div>

      <h2 className="mt-8 font-display text-xl font-extrabold text-ink-900 dark:text-white md:mt-10 md:text-2xl">
        Your favorites
      </h2>
      {saved.length === 0 ? (
        <p className="mt-3 text-ink-500">
          You haven&apos;t saved any restaurants yet.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5 md:grid-cols-4 md:gap-4">
          {saved.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
