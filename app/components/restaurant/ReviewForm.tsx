"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  Camera,
  X,
  Search,
  Check,
  Utensils,
  Clock,
  Wallet,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
} from "lucide-react";
import type { DishVerdict, MenuSection, VisitType } from "@/app/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { addReview, uploadReviewPhoto } from "@/app/lib/reviews";
import { scanDocId, dayKey, VERIFIED_WINDOW_MS } from "@/app/lib/scan";
import { useAuth } from "@/app/providers/AuthProvider";
import { cx } from "@/app/lib/utils";
import { StarInput } from "../ui/Stars";
import { Textarea, Label, Input } from "../ui/Field";

const MAX_PHOTOS = 3;

const VISIT_TYPES: { key: VisitType; label: string; icon: typeof Utensils }[] = [
  { key: "dine-in", label: "Ate in", icon: UtensilsCrossed },
  { key: "takeaway", label: "Takeaway", icon: ShoppingBag },
  { key: "delivery", label: "Delivery", icon: Bike },
];

/**
 * Everything a review can carry: the overall rating, the write-up, photos, the
 * dishes they actually ordered with a rating each, and the practical details
 * (how they ate, how long they waited, what it came to per person).
 *
 * Only the star rating and a few words are required. Every other field is
 * offered but never demanded — a form that insists on nine answers gets fewer
 * reviews, and dish ratings are worth more when the people who bother are the
 * ones who remember.
 */
export function ReviewForm({
  restaurantId,
  menu,
  onPosted,
  onCancel,
}: {
  restaurantId: string;
  menu?: MenuSection[];
  onPosted: (earnedFor: { contentLength: number }) => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [dishes, setDishes] = useState<DishVerdict[]>([]);
  const [dishQuery, setDishQuery] = useState("");
  const [photos, setPhotos] = useState<{ url: string; file: File }[]>([]);
  const [visitType, setVisitType] = useState<VisitType | null>(null);
  const [waitMinutes, setWaitMinutes] = useState("");
  const [spendPerHead, setSpendPerHead] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allDishes = useMemo(
    () => (menu ?? []).flatMap((s) => s.items.map((i) => i.name)),
    [menu]
  );

  const dishMatches = useMemo(() => {
    const q = dishQuery.trim().toLowerCase();
    const chosen = new Set(dishes.map((d) => d.name.toLowerCase()));
    return allDishes
      .filter((n) => !chosen.has(n.toLowerCase()))
      .filter((n) => (q ? n.toLowerCase().includes(q) : true))
      .slice(0, q ? 6 : 8);
  }, [allDishes, dishQuery, dishes]);

  const addDish = (name: string) => {
    setDishes((d) => [...d, { name }]);
    setDishQuery("");
  };

  const rateDish = (name: string, value: number) =>
    setDishes((d) =>
      d.map((x) =>
        x.name === name ? { ...x, rating: x.rating === value ? undefined : value } : x
      )
    );

  const pickPhotos = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, room));
    setPhotos((p) => [
      ...p,
      ...picked.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  };

  const removePhoto = (url: string) => {
    URL.revokeObjectURL(url);
    setPhotos((p) => p.filter((x) => x.url !== url));
  };

  const submit = async () => {
    if (!user) return;
    if (rating === 0) return setError("Pick a rating first.");
    if (text.trim().length < 4) return setError("Add a few words about the place.");

    setSaving(true);
    setError(null);
    try {
      // Photos first: a review that saved without its pictures can't get them
      // back, whereas a failed upload can just be retried before posting.
      const urls: string[] = [];
      for (const photo of photos) {
        urls.push(await uploadReviewPhoto(restaurantId, user.uid, photo.file));
      }

      // A scan today, or late last night, marks this as a verified visit.
      let verifiedVisit = false;
      try {
        const yesterday = dayKey(new Date(Date.now() - VERIFIED_WINDOW_MS));
        const [todayScan, lastScan] = await Promise.all([
          getDoc(doc(db, "scans", scanDocId(user.uid, restaurantId))),
          getDoc(doc(db, "scans", scanDocId(user.uid, restaurantId, yesterday))),
        ]);
        const scan = todayScan.exists() ? todayScan : lastScan;
        verifiedVisit =
          scan.exists() && Date.now() - (scan.data().at ?? 0) < VERIFIED_WINDOW_MS;
      } catch {
        // No scan record, or offline — the review posts unverified.
      }

      await addReview({
        restaurantId,
        userId: user.uid,
        name: user.displayName ?? user.email?.split("@")[0] ?? "Anonymous",
        rating,
        content: text.trim(),
        dishes: dishes.length ? dishes : undefined,
        photos: urls.length ? urls : undefined,
        verifiedVisit: verifiedVisit || undefined,
        visitType: visitType ?? undefined,
        waitMinutes: waitMinutes ? Number(waitMinutes) : undefined,
        spendPerHead: spendPerHead ? Number(spendPerHead) : undefined,
      });

      photos.forEach((p) => URL.revokeObjectURL(p.url));
      onPosted({ contentLength: text.trim().length });
    } catch {
      setError("Couldn't save your review. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1 — the rating */}
      <div>
        <Label>How was it overall?</Label>
        <StarInput value={rating} onChange={setRating} />
      </div>

      {/* 2 — the words */}
      <div>
        <Label>Your review</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you order, how was the service, would you go back?"
        />
      </div>

      {/* 3 — the dishes */}
      {allDishes.length > 0 && (
        <div>
          <Label>What did you order?</Label>
          <p className="-mt-1 mb-2 text-xs text-ink-400">
            Rate the dishes and they get their own score on the menu.
          </p>

          {dishes.length > 0 && (
            <ul className="mb-2 space-y-1.5">
              <AnimatePresence initial={false}>
                {dishes.map((d) => (
                  <motion.li
                    key={d.name}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-2xl border border-ink-100 p-2.5 dark:border-ink-800"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900 dark:text-white">
                      {d.name}
                    </span>
                    <span className="flex shrink-0 gap-0.5">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => rateDish(d.name, v)}
                          aria-label={`${v} for ${d.name}`}
                          className="p-0.5"
                        >
                          <span
                            className={cx(
                              "block h-4 w-4 rounded-full transition",
                              (d.rating ?? 0) >= v
                                ? "bg-saffron-500"
                                : "bg-ink-200 dark:bg-ink-700"
                            )}
                          />
                        </button>
                      ))}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDishes((x) => x.filter((y) => y.name !== d.name))}
                      aria-label={`Remove ${d.name}`}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
                    >
                      <X size={14} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <Input
              value={dishQuery}
              onChange={(e) => setDishQuery(e.target.value)}
              placeholder={dishes.length ? "Add another dish" : "Search the menu"}
              className="pl-10"
            />
          </div>

          {dishMatches.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {dishMatches.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addDish(name)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-ink-200 px-3 text-[13px] text-ink-600 transition active:scale-95 dark:border-ink-700 dark:text-ink-300 md:hover:border-root-300 md:hover:text-root-600"
                >
                  <Utensils size={12} /> {name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4 — photos */}
      <div>
        <Label>Photos</Label>
        <div className="flex flex-wrap gap-2">
          {photos.map((p) => (
            <div
              key={p.url}
              className="relative h-20 w-20 overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800"
            >
              <Image src={p.url} alt="" fill sizes="80px" className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => removePhoto(p.url)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink-900/70 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="grid h-20 w-20 place-items-center gap-1 rounded-2xl border border-dashed border-ink-300 text-ink-400 transition active:scale-95 dark:border-ink-700"
            >
              <Camera size={20} />
              <span className="text-[11px]">Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            pickPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="mt-1.5 text-xs text-ink-400">
          Up to {MAX_PHOTOS}. Resized on your phone before uploading, and the
          location tag is stripped.
        </p>
      </div>

      {/* 5 — the practical details */}
      <div className="space-y-3 rounded-2xl bg-ink-50 p-3.5 dark:bg-ink-800/50">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Optional, but useful to the next person
        </p>

        <div className="flex flex-wrap gap-1.5">
          {VISIT_TYPES.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setVisitType((t) => (t === v.key ? null : v.key))}
              aria-pressed={visitType === v.key}
              className={cx(
                "inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition active:scale-95",
                visitType === v.key
                  ? "border-root-500 bg-root-500 text-white"
                  : "border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300"
              )}
            >
              {visitType === v.key ? <Check size={13} /> : <v.icon size={13} />}
              {v.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs text-ink-500">
              <Clock size={12} /> Waited (min)
            </span>
            <Input
              value={waitMinutes}
              onChange={(e) => setWaitMinutes(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="15"
            />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs text-ink-500">
              <Wallet size={12} /> Per person (MVR)
            </span>
            <Input
              value={spendPerHead}
              onChange={(e) => setSpendPerHead(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="180"
            />
          </label>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-root-50 px-3 py-2 text-sm text-root-700 dark:bg-root-900/20 dark:text-root-300">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[48px] rounded-full border border-ink-200 px-5 font-semibold text-ink-700 transition active:scale-95 dark:border-ink-700 dark:text-ink-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-root-500 font-semibold text-white transition hover:bg-root-600 active:scale-[0.98] disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Posting…" : "Post review"}
        </button>
      </div>
    </div>
  );
}
