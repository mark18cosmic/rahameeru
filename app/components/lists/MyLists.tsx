"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { MAX_TITLE, createList, useMyLists } from "@/app/lib/lists";
import { Photo } from "../ui/Photo";
import { Button, ButtonLink } from "../ui/Button";
import { Input } from "../ui/Field";

/** The signed-in user's lists, with a way to start a new one. */
export function MyLists() {
  const { user } = useAuth();
  const router = useRouter();
  const { restaurants } = useRestaurants();
  const { lists, ready } = useMyLists(user);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const byId = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), [restaurants]);

  const create = async () => {
    if (!user || !title.trim()) return;
    setCreating(true);
    try {
      const id = await createList(user, { title });
      router.push(`/lists/${id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section id="lists" className="scroll-mt-24">
      <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white md:text-2xl">Your lists</h2>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        Named collections you can share with a link.
      </p>

      {!user ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ButtonLink href="/login?next=%2Ffavorites%23lists" size="sm">
            Sign in to make lists
          </ButtonLink>
        </div>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              create();
            }}
            className="mt-4 flex max-w-lg gap-2"
          >
            <Input
              aria-label="New list name"
              value={title}
              maxLength={MAX_TITLE}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New list, e.g. Where to take visitors"
            />
            <Button type="submit" disabled={!title.trim() || creating} className="shrink-0">
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Create
            </Button>
          </form>

          {ready && lists.length > 0 && (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lists.map((l) => {
                const covers = l.restaurantIds
                  .map((rid) => byId.get(rid))
                  .filter(Boolean)
                  .slice(0, 3) as Restaurant[];
                return (
                  <li key={l.id}>
                    <Link href={`/lists/${l.id}`} className="surface press group flex items-center gap-4 rounded-2xl p-3">
                      <span className="grid h-16 w-24 shrink-0 grid-cols-3 gap-0.5 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                        {covers.map((r) => (
                          <span key={r.id} className="relative">
                            <Photo r={r} sizes="32px" alt="" />
                          </span>
                        ))}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink-900 group-hover:text-root-600 dark:text-white">
                          {l.title}
                        </span>
                        <span className="block text-sm text-ink-500 dark:text-ink-400">
                          {l.restaurantIds.length} {l.restaurantIds.length === 1 ? "place" : "places"}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
