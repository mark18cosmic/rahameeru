"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import type { Review } from "@/app/lib/types";
import { getReviews, addReview } from "@/app/lib/reviews";
import { useAuth } from "@/app/providers/AuthProvider";
import { Stars, StarInput } from "../ui/Stars";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Textarea, Label } from "../ui/Field";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  const units: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [secs, label] of units) {
    const v = Math.floor(s / secs);
    if (v >= 1) return `${v}${label} ago`;
  }
  return "just now";
}

export function Reviews({
  restaurantId,
  seedCount,
  seedRating,
}: {
  restaurantId: string;
  seedCount: number;
  seedRating: number;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    getReviews(restaurantId)
      .then(setReviews)
      .finally(() => setLoading(false));
  };
  useEffect(load, [restaurantId]);

  const submit = async () => {
    if (!user) return;
    if (rating === 0) return setError("Please pick a rating.");
    if (text.trim().length < 4) return setError("Add a few words to your review.");
    setSaving(true);
    setError(null);
    try {
      await addReview({
        restaurantId,
        userId: user.uid,
        name: user.displayName ?? user.email?.split("@")[0] ?? "Anonymous",
        rating,
        content: text.trim(),
      });
      setText("");
      setRating(0);
      setOpen(false);
      setLoading(true);
      load();
    } catch {
      setError("Couldn't save your review. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const communityCount = seedCount + reviews.length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
            Reviews
          </h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-ink-500">
            <Stars value={seedRating} size={16} />
            <span className="font-semibold text-ink-800 dark:text-ink-100">
              {seedRating.toFixed(1)}
            </span>
            <span>· {communityCount.toLocaleString()} reviews</span>
          </div>
        </div>
        {user ? (
          <Button onClick={() => setOpen(true)} size="sm">
            <MessageSquarePlus size={16} /> Write a review
          </Button>
        ) : (
          <Button onClick={() => (window.location.href = "/login")} variant="outline" size="sm">
            Sign in to review
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-ink-400">
            <Loader2 className="animate-spin" size={18} /> Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-200 py-12 text-center dark:border-ink-700">
            <p className="font-semibold text-ink-700 dark:text-ink-200">
              No community reviews yet
            </p>
            <p className="mt-1 text-sm text-ink-400">
              Be the first to share your experience.
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-root-100 font-bold text-root-600 dark:bg-root-900/30">
                    {r.name[0]?.toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-white">
                      {r.name}
                    </p>
                    <p className="text-xs text-ink-400">{timeAgo(r.createdAt)}</p>
                  </div>
                </div>
                <Stars value={r.rating} size={15} />
              </div>
              <p className="mt-3 text-ink-600 dark:text-ink-300">{r.content}</p>
            </div>
          ))
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Write a review">
        <div className="space-y-4">
          <div>
            <Label>Your rating</Label>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <div>
            <Label>Your review</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you order? How was the vibe, service, value?"
            />
          </div>
          {error && <p className="text-sm text-root-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              Post review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
