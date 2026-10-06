"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Link2, Loader2, Pencil, Trash2, X } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRestaurants } from "@/app/lib/useRestaurants";
import {
  MAX_DESCRIPTION,
  MAX_TITLE,
  deleteList,
  updateList,
  watchList,
  type PlaceList,
} from "@/app/lib/lists";
import { RestaurantCard } from "../RestaurantCard";
import { Button, ButtonLink } from "../ui/Button";
import { GridSkeleton } from "../ui/Skeletons";
import { StaggerItem } from "../ui/Reveal";
import { Input, Label, Textarea } from "../ui/Field";

type State = { status: "loading" } | { status: "missing" } | { status: "error" } | { status: "ready"; list: PlaceList };

export function ListView({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const { restaurants } = useRestaurants();
  const [state, setState] = useState<State>({ status: "loading" });
  const [editing, setEditing] = useState(false);

  useEffect(
    () =>
      watchList(
        id,
        (list) => setState(list ? { status: "ready", list } : { status: "missing" }),
        () => setState({ status: "error" })
      ),
    [id]
  );

  const list = state.status === "ready" ? state.list : null;
  const owner = Boolean(user && list && user.uid === list.ownerId);

  // In the order the owner set, skipping any place that has since been removed.
  const places = useMemo(() => {
    const byId = new Map(restaurants.map((r) => [r.id, r]));
    return (list?.restaurantIds ?? []).map((rid) => byId.get(rid)).filter(Boolean) as Restaurant[];
  }, [list?.restaurantIds, restaurants]);

  if (state.status === "loading") return <GridSkeleton label="Loading list" cards={4} />;
  if (state.status !== "ready" || !list) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          {state.status === "missing" ? "This list isn't here" : "Couldn't open the list"}
        </h1>
        <p className="mt-2 text-ink-500 dark:text-ink-400">
          {state.status === "missing"
            ? "It may have been deleted by whoever made it."
            : "Check your connection and try again."}
        </p>
        <ButtonLink href="/explore" className="mt-6">
          Explore restaurants
        </ButtonLink>
      </div>
    );
  }

  const move = (rid: string, dir: -1 | 1) => {
    const ids = [...list.restaurantIds];
    const i = ids.indexOf(rid);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    updateList(list.id, { restaurantIds: ids }).catch(() => {});
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 md:px-6 md:pt-10">
      {editing ? (
        <EditHeader list={list} onDone={() => setEditing(false)} />
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <p className="text-sm font-semibold text-root-600 dark:text-root-400">
              A list by {owner ? "you" : list.ownerName}
            </p>
            <h1 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white md:text-5xl">
              {list.title}
            </h1>
            {list.description && (
              <p className="mt-3 text-ink-600 dark:text-ink-300 md:text-lg">{list.description}</p>
            )}
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              {places.length} {places.length === 1 ? "place" : "places"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {owner && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil size={15} /> Edit
              </Button>
            )}
            <ShareButton title={list.title} />
          </div>
        </div>
      )}

      {places.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-[var(--line-strong)] px-5 py-14 text-center">
          <p className="font-semibold text-ink-800 dark:text-ink-100">Nothing on this list yet</p>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {owner
              ? "Open any restaurant and tap Add to list."
              : "Whoever made it hasn't added any places so far."}
          </p>
          {owner && (
            <ButtonLink href="/explore" className="mt-5">
              Find places
            </ButtonLink>
          )}
        </div>
      ) : (
        <ol className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {places.map((r, i) => (
            <StaggerItem as="li" key={r.id} index={i} className="flex flex-col">
              <RestaurantCard r={r} />
              {owner && editing && (
                <div className="mt-2 flex items-center gap-1.5">
                  <IconButton label={`Move ${r.name} earlier`} disabled={i === 0} onClick={() => move(r.id, -1)}>
                    <ArrowUp size={15} />
                  </IconButton>
                  <IconButton
                    label={`Move ${r.name} later`}
                    disabled={i === places.length - 1}
                    onClick={() => move(r.id, 1)}
                  >
                    <ArrowDown size={15} />
                  </IconButton>
                  <IconButton
                    label={`Remove ${r.name}`}
                    onClick={() =>
                      updateList(list.id, {
                        restaurantIds: list.restaurantIds.filter((x) => x !== r.id),
                      }).catch(() => {})
                    }
                  >
                    <X size={15} />
                  </IconButton>
                </div>
              )}
            </StaggerItem>
          ))}
        </ol>
      )}

      {owner && editing && (
        <DeleteList
          onDelete={async () => {
            await deleteList(list.id);
            router.push("/favorites#lists");
          }}
        />
      )}
    </div>
  );
}

function EditHeader({ list, onDone }: { list: PlaceList; onDone: () => void }) {
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateList(list.id, {
        title: title.trim().slice(0, MAX_TITLE),
        description: description.trim().slice(0, MAX_DESCRIPTION),
      });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="surface max-w-2xl space-y-4 rounded-3xl p-5">
      <div>
        <Label htmlFor="list-title">Name</Label>
        <Input id="list-title" value={title} maxLength={MAX_TITLE} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="list-description">Description (optional)</Label>
        <Textarea
          id="list-description"
          value={description}
          maxLength={MAX_DESCRIPTION}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What ties these places together?"
        />
      </div>
      <p className="text-sm text-ink-500 dark:text-ink-400">
        Reorder or remove places with the buttons under each one.
      </p>
      <div className="flex gap-2">
        <Button onClick={save} disabled={saving || !title.trim()}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Done
        </Button>
      </div>
    </div>
  );
}

function DeleteList({ onDelete }: { onDelete: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="mt-12 border-t border-[var(--line)] pt-6">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-ink-700 dark:text-ink-200">
            Delete this list for everyone with the link?
          </span>
          <Button onClick={onDelete} className="bg-root-600">
            <Trash2 size={15} /> Delete
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-root-600 dark:text-root-400"
        >
          <Trash2 size={15} /> Delete list
        </button>
      )}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="surface press grid h-9 w-9 place-items-center rounded-full text-ink-600 disabled:opacity-40 dark:text-ink-300"
    >
      {children}
    </button>
  );
}

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed.
    }
  };
  return (
    <Button onClick={share}>
      {copied ? <Check size={16} /> : <Link2 size={16} />}
      {copied ? "Link copied" : "Share list"}
    </Button>
  );
}
