"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ListPlus, Loader2, Plus } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  MAX_LIST,
  MAX_TITLE,
  addToList,
  createList,
  removeFromList,
  useMyLists,
} from "@/app/lib/lists";
import { cx } from "@/app/lib/utils";
import { Modal } from "../ui/Modal";
import { Button, ButtonLink } from "../ui/Button";
import { Input } from "../ui/Field";

/** "Add to list" on a restaurant page: tick it into any of your lists. */
export function AddToList({ restaurant }: { restaurant: Restaurant }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { lists, ready } = useMyLists(user);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const inCount = lists.filter((l) => l.restaurantIds.includes(restaurant.id)).length;

  const toggle = async (id: string, inList: boolean) => {
    setBusy(id);
    setFailed(false);
    try {
      await (inList ? removeFromList(id, restaurant.id) : addToList(id, restaurant.id));
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  };

  const create = async () => {
    if (!user || !title.trim()) return;
    setBusy("new");
    setFailed(false);
    try {
      await createList(user, { title, restaurantIds: [restaurant.id] });
      setTitle("");
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[var(--line)] px-3.5 text-sm font-medium text-ink-700 transition hover:border-[var(--line-strong)] active:scale-[0.98] dark:text-ink-200"
      >
        {inCount > 0 ? <Check size={15} className="text-root-500" /> : <ListPlus size={15} />}
        {inCount > 0 ? `In ${inCount} ${inCount === 1 ? "list" : "lists"}` : "Add to list"}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Add ${restaurant.name} to a list`}>
        {!user ? (
          <div>
            <p className="text-ink-600 dark:text-ink-300">
              Lists are yours to share: &ldquo;Best brunch in Hulhumalé&rdquo;,
              &ldquo;Where to take visitors&rdquo;. Sign in to start one.
            </p>
            <ButtonLink href={`/login?next=${encodeURIComponent(pathname)}`} className="mt-4">
              Sign in
            </ButtonLink>
          </div>
        ) : (
          <div>
            {!ready ? (
              <Loader2 size={18} className="animate-spin text-ink-400" />
            ) : lists.length === 0 ? (
              <p className="text-sm text-ink-500 dark:text-ink-400">
                You haven&apos;t made a list yet. Name your first one below.
              </p>
            ) : (
              <ul className="-mx-2 max-h-[45vh] overflow-y-auto">
                {lists.map((l) => {
                  const inList = l.restaurantIds.includes(restaurant.id);
                  const full = !inList && l.restaurantIds.length >= MAX_LIST;
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => toggle(l.id, inList)}
                        disabled={busy !== null || full}
                        aria-pressed={inList}
                        className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-2 text-left transition hover:bg-[var(--well)] disabled:opacity-50"
                      >
                        <span
                          className={cx(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-md border",
                            inList ? "border-root-500 bg-root-500 text-white" : "border-[var(--line-strong)]"
                          )}
                        >
                          {busy === l.id ? <Loader2 size={13} className="animate-spin" /> : inList && <Check size={14} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink-900 dark:text-white">{l.title}</span>
                          <span className="block text-xs text-ink-500 dark:text-ink-400">
                            {full ? "Full" : `${l.restaurantIds.length} ${l.restaurantIds.length === 1 ? "place" : "places"}`}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                create();
              }}
              className="mt-4 flex gap-2 border-t border-[var(--line)] pt-4"
            >
              <Input
                aria-label="New list name"
                value={title}
                maxLength={MAX_TITLE}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New list, e.g. Best brunch"
              />
              <Button type="submit" disabled={!title.trim() || busy !== null} className="shrink-0">
                {busy === "new" ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Create
              </Button>
            </form>
            {failed && (
              <p className="mt-2 text-sm text-root-600 dark:text-root-400">
                That didn&apos;t save. Check your connection and try again.
              </p>
            )}
            {lists.length > 0 && (
              <Link href="/favorites#lists" className="mt-3 inline-block text-sm font-semibold text-root-600 dark:text-root-400">
                See all your lists
              </Link>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
