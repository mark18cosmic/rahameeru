"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Plus,
  Star,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { MenuSection, Restaurant } from "@/app/lib/types";
import { useRestaurants } from "@/app/lib/useRestaurants";
import {
  deleteRestaurant,
  saveMenu,
  savePhotos,
  saveRestaurant,
  setFeatured,
  setHidden,
  type RestaurantDraft,
  type SiteSettings,
} from "@/app/lib/admin";
import { cx } from "@/app/lib/utils";
import { Input, Label, Textarea } from "../../ui/Field";
import { Photo } from "../../ui/Photo";

const EMPTY: RestaurantDraft = {
  name: "",
  description: "",
  location: "",
  cuisine: [],
  tags: [],
  priceLevel: 2,
};

const list = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/* -------------------------------------------------------------------------- */
/* Menu editor                                                                */
/* -------------------------------------------------------------------------- */

function MenuEditor({
  restaurant,
  onDone,
}: {
  restaurant: Restaurant;
  onDone: () => void;
}) {
  const [menu, setMenu] = useState<MenuSection[]>(
    () => restaurant.menu?.map((s) => ({ ...s, items: [...s.items] })) ?? []
  );
  const [saving, setSaving] = useState(false);

  const patchSection = (i: number, patch: Partial<MenuSection>) =>
    setMenu((m) => m.map((s, x) => (x === i ? { ...s, ...patch } : s)));

  const patchItem = (si: number, ii: number, patch: Record<string, unknown>) =>
    setMenu((m) =>
      m.map((s, x) =>
        x === si
          ? {
              ...s,
              items: s.items.map((it, y) => (y === ii ? { ...it, ...patch } : it)),
            }
          : s
      )
    );

  const save = async () => {
    setSaving(true);
    try {
      // Sections and dishes with no name are drafts the admin abandoned — drop
      // them rather than writing empty rows onto a public menu.
      const clean = menu
        .map((s) => ({
          ...s,
          items: s.items.filter((i) => i.name.trim()),
        }))
        .filter((s) => s.name.trim() && s.items.length);
      await saveMenu(restaurant.id, clean);
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {menu.map((section, si) => (
        <div key={si} className="clay-inset rounded-[1.5rem] p-4">
          <div className="flex items-center gap-2">
            <Input
              value={section.name}
              onChange={(e) => patchSection(si, { name: e.target.value })}
              placeholder="Section, e.g. Starters"
              className="font-semibold"
            />
            <button
              onClick={() => setMenu((m) => m.filter((_, x) => x !== si))}
              aria-label={`Remove section ${section.name || si + 1}`}
              className="clay-sm clay-press grid h-11 w-11 shrink-0 place-items-center rounded-full text-root-600"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {section.items.map((item, ii) => (
              <div key={ii} className="grid gap-2 sm:grid-cols-[1fr_7rem_2.75rem]">
                <Input
                  value={item.name}
                  onChange={(e) => patchItem(si, ii, { name: e.target.value })}
                  placeholder="Dish"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  value={item.price}
                  onChange={(e) =>
                    patchItem(si, ii, { price: Number(e.target.value) || 0 })
                  }
                  placeholder="MVR"
                />
                <button
                  onClick={() =>
                    patchSection(si, {
                      items: section.items.filter((_, y) => y !== ii),
                    })
                  }
                  aria-label={`Remove ${item.name || "dish"}`}
                  className="clay-sm clay-press grid h-11 w-full place-items-center rounded-2xl text-root-600 sm:w-11"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                patchSection(si, {
                  items: [...section.items, { name: "", price: 0 }],
                })
              }
              className="clay-sm clay-press inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 text-sm font-semibold"
            >
              <Plus size={14} /> Dish
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMenu((m) => [...m, { name: "", items: [] }])}
          className="clay-sm clay-press inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-semibold"
        >
          <Plus size={15} /> Section
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="clay-root clay-press inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-semibold disabled:opacity-60"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Save menu
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Photo manager                                                              */
/* -------------------------------------------------------------------------- */

function PhotoManager({
  restaurant,
  onDone,
}: {
  restaurant: Restaurant;
  onDone: () => void;
}) {
  const [image, setImage] = useState(restaurant.image ?? "");
  const [gallery, setGallery] = useState<string[]>(restaurant.gallery ?? []);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await savePhotos(
        restaurant.id,
        image.trim() || undefined,
        gallery.map((g) => g.trim()).filter(Boolean)
      );
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <Label>Main photo URL</Label>
        <Input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://… — leave empty to use the automatic lookup"
        />
        <p className="mt-1.5 text-xs text-ink-400">
          Clearing this hands the listing back to the photo search, which finds
          a real picture by name.
        </p>
      </div>

      <div className="relative aspect-[4/3] max-w-xs overflow-hidden rounded-[1.35rem] bg-ink-100 dark:bg-ink-800">
        <Photo r={{ ...restaurant, image: image || undefined }} sizes="320px" />
      </div>

      <div>
        <Label>Gallery</Label>
        <div className="space-y-2">
          {gallery.map((g, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={g}
                onChange={(e) =>
                  setGallery((xs) =>
                    xs.map((x, y) => (y === i ? e.target.value : x))
                  )
                }
                placeholder="https://…"
              />
              <button
                onClick={() => setGallery((xs) => xs.filter((_, y) => y !== i))}
                aria-label={`Remove gallery photo ${i + 1}`}
                className="clay-sm clay-press grid h-11 w-11 shrink-0 place-items-center rounded-full text-root-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setGallery((xs) => [...xs, ""])}
          className="clay-sm clay-press mt-2 inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 text-sm font-semibold"
        >
          <ImagePlus size={14} /> Add photo
        </button>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="clay-root clay-press inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-semibold disabled:opacity-60"
      >
        {saving && <Loader2 size={15} className="animate-spin" />}
        Save photos
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Details editor                                                             */
/* -------------------------------------------------------------------------- */

function DetailsEditor({
  restaurant,
  onDone,
}: {
  restaurant?: Restaurant;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<RestaurantDraft>(() =>
    restaurant
      ? {
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description,
          location: restaurant.location,
          address: restaurant.address,
          phone: restaurant.phone,
          email: restaurant.email,
          cuisine: restaurant.cuisine,
          tags: restaurant.tags,
          priceLevel: restaurant.priceLevel,
          featured: restaurant.featured,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<RestaurantDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const save = async () => {
    if (!draft.name.trim()) return;
    setSaving(true);
    try {
      await saveRestaurant(draft, restaurant?.id);
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        </div>
        <div>
          <Label>Area</Label>
          <Input
            value={draft.location}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="Malé"
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={draft.description}
          onChange={(e) => set({ description: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Cuisine (comma separated)</Label>
          <Input
            value={draft.cuisine.join(", ")}
            onChange={(e) => set({ cuisine: list(e.target.value) })}
          />
        </div>
        <div>
          <Label>Tags (comma separated)</Label>
          <Input
            value={draft.tags.join(", ")}
            onChange={(e) => set({ tags: list(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Phone</Label>
          <Input
            value={draft.phone ?? ""}
            onChange={(e) => set({ phone: e.target.value })}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            value={draft.email ?? ""}
            onChange={(e) => set({ email: e.target.value })}
          />
        </div>
        <div>
          <Label>Price level</Label>
          <div className="flex gap-1.5">
            {([1, 2, 3, 4] as const).map((n) => (
              <button
                key={n}
                onClick={() => set({ priceLevel: n })}
                className={cx(
                  "min-h-[44px] flex-1 rounded-2xl text-sm font-bold transition",
                  draft.priceLevel === n
                    ? "clay-root"
                    : "clay-sm clay-press text-ink-500"
                )}
              >
                {"$".repeat(n)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label>Address</Label>
        <Input
          value={draft.address ?? ""}
          onChange={(e) => set({ address: e.target.value })}
        />
      </div>

      <button
        onClick={save}
        disabled={saving || !draft.name.trim()}
        className="clay-root clay-press inline-flex min-h-[48px] items-center gap-2 rounded-full px-6 font-semibold disabled:opacity-60"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        {restaurant ? "Save changes" : "Create listing"}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Manager                                                                    */
/* -------------------------------------------------------------------------- */

type Panel = "details" | "menu" | "photos";

export function RestaurantManager({
  settings,
  onSettingsChange,
}: {
  settings: SiteSettings;
  onSettingsChange: () => void;
}) {
  const { restaurants, loading } = useRestaurants();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("details");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return restaurants;
    return restaurants.filter((r) =>
      `${r.name} ${r.location} ${r.cuisine.join(" ")}`
        .toLowerCase()
        .includes(term)
    );
  }, [restaurants, q]);

  const toggleHidden = async (r: Restaurant) => {
    setBusy(r.id);
    try {
      await setHidden(settings, r.id, !settings.hidden.includes(r.id));
      onSettingsChange();
    } finally {
      setBusy(null);
    }
  };

  const toggleFeatured = async (r: Restaurant) => {
    setBusy(r.id);
    try {
      await setFeatured(r.id, !r.featured);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a listing…"
          className="max-w-xs"
        />
        <button
          onClick={() => {
            setCreating((v) => !v);
            setOpenId(null);
          }}
          className="clay-root clay-press inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 font-semibold"
        >
          {creating ? <X size={16} /> : <Plus size={16} />}
          {creating ? "Cancel" : "New listing"}
        </button>
      </div>

      {creating && (
        <div className="clay mt-4 rounded-[2rem] p-5">
          <h3 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
            New listing
          </h3>
          <DetailsEditor onDone={() => setCreating(false)} />
        </div>
      )}

      <p className="mt-5 text-sm text-ink-500">
        {loading ? "Loading…" : `${shown.length} listings`}
      </p>

      <div className="mt-3 space-y-3">
        {shown.map((r) => {
          const open = openId === r.id;
          const hidden = settings.hidden.includes(r.id);
          return (
            <div key={r.id} className="clay rounded-[1.75rem] p-4">
              <div className="flex items-start gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800">
                  <Photo r={r} sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-ink-900 dark:text-white">
                    {r.name}
                  </h3>
                  <p className="truncate text-sm text-ink-500">
                    {r.location}
                    {r.cuisine.length > 0 && ` · ${r.cuisine.join(", ")}`}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {r.featured && (
                      <span className="clay-saffron rounded-full px-2 py-0.5 text-[11px] font-bold">
                        Featured
                      </span>
                    )}
                    {hidden && (
                      <span className="clay-inset rounded-full px-2 py-0.5 text-[11px] font-bold text-ink-500">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(
                  [
                    ["details", "Details", UtensilsCrossed],
                    ["menu", "Menu", UtensilsCrossed],
                    ["photos", "Photos", ImagePlus],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setPanel(key);
                      setOpenId(open && panel === key ? null : r.id);
                    }}
                    className={cx(
                      "min-h-[38px] rounded-full px-3.5 text-xs font-semibold transition",
                      open && panel === key
                        ? "clay-root"
                        : "clay-sm clay-press text-ink-600 dark:text-ink-300"
                    )}
                  >
                    {label}
                  </button>
                ))}

                <button
                  onClick={() => toggleFeatured(r)}
                  disabled={busy === r.id}
                  className="clay-sm clay-press inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-ink-600 disabled:opacity-60 dark:text-ink-300"
                >
                  <Star
                    size={13}
                    className={r.featured ? "fill-saffron-500 text-saffron-500" : ""}
                  />
                  {r.featured ? "Unfeature" : "Feature"}
                </button>

                <button
                  onClick={() => toggleHidden(r)}
                  disabled={busy === r.id}
                  className="clay-sm clay-press inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-ink-600 disabled:opacity-60 dark:text-ink-300"
                >
                  {hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                  {hidden ? "Show" : "Hide"}
                </button>

                {/* Delete asks twice. A listing carries other people's reviews,
                    so removing it is not the admin's own data to lose. */}
                {confirmDelete === r.id ? (
                  <span className="inline-flex items-center gap-1.5">
                    <button
                      onClick={async () => {
                        setBusy(r.id);
                        try {
                          await deleteRestaurant(r.id);
                        } finally {
                          setBusy(null);
                          setConfirmDelete(null);
                        }
                      }}
                      className="clay-root clay-press inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 text-xs font-bold"
                    >
                      <Check size={13} /> Really delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="clay-sm clay-press min-h-[38px] rounded-full px-3.5 text-xs font-semibold"
                    >
                      Keep
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(r.id)}
                    className="clay-sm clay-press inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-root-600"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>

              {open && panel === "details" && (
                <DetailsEditor restaurant={r} onDone={() => setOpenId(null)} />
              )}
              {open && panel === "menu" && (
                <MenuEditor restaurant={r} onDone={() => setOpenId(null)} />
              )}
              {open && panel === "photos" && (
                <PhotoManager restaurant={r} onDone={() => setOpenId(null)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
