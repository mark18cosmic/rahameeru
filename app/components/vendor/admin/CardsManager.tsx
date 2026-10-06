"use client";

import { useMemo, useState } from "react";
import { Check, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { useMyLists } from "@/app/lib/lists";
import { deleteCard, saveGuide, useAllCards, type ContentCard } from "@/app/lib/cards";
import { cx } from "@/app/lib/utils";
import { Input, Label, Textarea } from "../../ui/Field";
import { Button } from "../../ui/Button";
import { ContentCardView } from "../../cards/ContentCards";

type Draft = { id?: string; title: string; body: string; image: string; href: string; order: number; active: boolean };
const EMPTY: Draft = { title: "", body: "", image: "", href: "", order: 0, active: true };

/**
 * Guides for the home page's "What's on" row, and oversight of the specials
 * restaurants post. Guides are written here; specials come from the vendor
 * dashboard and can only be taken down from here.
 */
export function CardsManager() {
  const { user } = useAuth();
  const { all, ready } = useAllCards();
  const { restaurants } = useRestaurants();
  const { lists } = useMyLists(user);
  const [draft, setDraft] = useState<Draft | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, Restaurant>();
    for (const r of restaurants) {
      m.set(r.id, r);
      m.set(r.slug, r);
    }
    return m;
  }, [restaurants]);

  const guides = all.filter((c) => c.kind === "guide").sort((a, b) => a.order - b.order);
  const specials = all.filter((c) => c.kind === "special").sort((a, b) => b.createdAt - a.createdAt);
  const restaurantOf = (c: ContentCard) =>
    byId.get(c.restaurantId ?? c.href?.match(/^\/restaurant\/([^/?#]+)/)?.[1] ?? "");

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Guides</h3>
            <p className="text-sm text-ink-500">
              Shown first in &ldquo;What&apos;s on&rdquo; on the home page, lowest order number first.
            </p>
          </div>
          {!draft && (
            <Button size="sm" onClick={() => setDraft({ ...EMPTY, order: guides.length })}>
              <Plus size={15} /> New guide
            </Button>
          )}
        </div>

        {draft && user && (
          <GuideForm
            draft={draft}
            setDraft={setDraft}
            lists={lists.map((l) => ({ id: l.id, title: l.title }))}
            restaurants={restaurants}
            preview={
              <ContentCardView
                card={{
                  id: "preview",
                  kind: "guide",
                  title: draft.title || "Your headline",
                  body: draft.body,
                  image: draft.image || undefined,
                  href: draft.href,
                  order: 0,
                  active: true,
                  createdAt: 0,
                  authorId: "",
                }}
                restaurant={byId.get(draft.href.match(/^\/restaurant\/([^/?#]+)/)?.[1] ?? "")}
              />
            }
            onSave={async (d) => {
              await saveGuide(
                {
                  title: d.title.trim(),
                  body: d.body.trim() || undefined,
                  image: d.image.trim() || undefined,
                  href: d.href.trim() || undefined,
                  order: d.order,
                  active: d.active,
                },
                user.uid,
                d.id
              );
              setDraft(null);
            }}
          />
        )}

        {!ready ? (
          <Loader2 size={18} className="mt-4 animate-spin text-ink-400" />
        ) : guides.length === 0 && !draft ? (
          <p className="well mt-4 rounded-2xl p-4 text-sm text-ink-500">
            No guides yet. A good first one links to a list, like &ldquo;Five places for a
            first date&rdquo;.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {guides.map((c) => (
              <li key={c.id} className={cx("space-y-2", !c.active && "opacity-60")}>
                <div className="h-[132px]">
                  <ContentCardView card={c} restaurant={restaurantOf(c)} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-ink-500">Order {c.order}</span>
                  <SmallButton onClick={() => setDraft({ id: c.id, title: c.title, body: c.body ?? "", image: c.image ?? "", href: c.href ?? "", order: c.order, active: c.active })}>
                    <Pencil size={13} /> Edit
                  </SmallButton>
                  <SmallButton
                    onClick={() =>
                      saveGuide(
                        { title: c.title, body: c.body, image: c.image, href: c.href, order: c.order, active: !c.active },
                        c.authorId,
                        c.id
                      )
                    }
                  >
                    {c.active ? <EyeOff size={13} /> : <Eye size={13} />} {c.active ? "Hide" : "Show"}
                  </SmallButton>
                  <ConfirmDelete onConfirm={() => deleteCard(c.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Today&apos;s specials</h3>
        <p className="text-sm text-ink-500">
          Posted by restaurant owners from their dashboard. Each lasts 24 hours.
        </p>
        {specials.length === 0 ? (
          <p className="well mt-4 rounded-2xl p-4 text-sm text-ink-500">No specials posted.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {specials.map((c) => {
              const expired = (c.expiresAt ?? 0) <= Date.now();
              return (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink-900 dark:text-white">{c.title}</span>
                    <span className="block text-sm text-ink-500">
                      {restaurantOf(c)?.name ?? c.restaurantId} ·{" "}
                      {expired ? "expired" : `live until ${new Date(c.expiresAt!).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}`}
                    </span>
                  </span>
                  <ConfirmDelete label="Take down" onConfirm={() => deleteCard(c.id)} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function GuideForm({
  draft,
  setDraft,
  lists,
  restaurants,
  preview,
  onSave,
}: {
  draft: Draft;
  setDraft: (d: Draft | null) => void;
  lists: { id: string; title: string }[];
  restaurants: Restaurant[];
  preview: React.ReactNode;
  onSave: (d: Draft) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  const badLink = draft.href.trim() !== "" && !draft.href.trim().startsWith("/");

  return (
    <div className="surface mt-4 grid gap-6 rounded-3xl p-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div>
          <Label htmlFor="guide-title">Headline</Label>
          <Input id="guide-title" value={draft.title} maxLength={80} onChange={(e) => set({ title: e.target.value })} placeholder="Five places for a first date" />
        </div>
        <div>
          <Label htmlFor="guide-body">Short text (optional)</Label>
          <Textarea id="guide-body" value={draft.body} maxLength={200} onChange={(e) => set({ body: e.target.value })} className="min-h-[80px]" />
        </div>
        <div>
          <Label htmlFor="guide-link">Opens</Label>
          <Input id="guide-link" value={draft.href} onChange={(e) => set({ href: e.target.value })} placeholder="/lists/… or /restaurant/… or /search?q=…" />
          {badLink && <p className="mt-1 text-sm text-root-600">Use a path inside the app, starting with /.</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              aria-label="Link to one of your lists"
              className="well min-h-[40px] rounded-xl px-3 text-sm"
              value=""
              onChange={(e) => e.target.value && set({ href: `/lists/${e.target.value}` })}
            >
              <option value="">Link to one of your lists…</option>
              {lists.map((l) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
            <select
              aria-label="Link to a restaurant"
              className="well min-h-[40px] rounded-xl px-3 text-sm"
              value=""
              onChange={(e) => e.target.value && set({ href: `/restaurant/${e.target.value}` })}
            >
              <option value="">…or a restaurant</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.slug}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="guide-image">Image URL (optional)</Label>
          <Input id="guide-image" value={draft.image} onChange={(e) => set({ image: e.target.value })} placeholder="https://… (a restaurant link uses its photo)" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-28">
            <Label htmlFor="guide-order">Order</Label>
            <Input id="guide-order" type="number" min={0} value={draft.order} onChange={(e) => set({ order: Number(e.target.value) || 0 })} />
          </div>
          <label className="mt-6 flex items-center gap-2 text-sm font-medium text-ink-800 dark:text-ink-100">
            <input type="checkbox" checked={draft.active} onChange={(e) => set({ active: e.target.checked })} className="h-5 w-5 accent-root-500" />
            Show on the home page
          </label>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={saving || !draft.title.trim() || badLink}
            onClick={async () => {
              setSaving(true);
              setFailed(false);
              try {
                await onSave(draft);
              } catch {
                setFailed(true);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Save guide
          </Button>
          <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
        </div>
        {failed && <p className="text-sm text-root-600">Couldn&apos;t save. Try again.</p>}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-ink-700 dark:text-ink-200">Preview</p>
        <div className="h-[132px]">{preview}</div>
      </div>
    </div>
  );
}

function SmallButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="surface press inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 font-medium text-ink-700 dark:text-ink-200">
      {children}
    </button>
  );
}

function ConfirmDelete({ onConfirm, label = "Delete" }: { onConfirm: () => Promise<void>; label?: string }) {
  const [sure, setSure] = useState(false);
  return (
    <button
      onClick={() => (sure ? onConfirm() : setSure(true))}
      onBlur={() => setSure(false)}
      className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 text-sm font-semibold text-root-600 dark:text-root-400"
    >
      <Trash2 size={13} /> {sure ? "Tap again to confirm" : label}
    </button>
  );
}
