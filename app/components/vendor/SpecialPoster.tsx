"use client";

import { useState } from "react";
import { Flame, Loader2, Send, Trash2 } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";
import { SPECIAL_HOURS, deleteCard, postSpecial, specialId, useLiveCards } from "@/app/lib/cards";
import { Input, Label } from "../ui/Field";
import { Button } from "../ui/Button";

/**
 * Lets an owner post today's special for their restaurant. It shows on the
 * home page and at the top of their page for 24 hours; posting again replaces
 * it, so there is never more than one per restaurant.
 */
export function SpecialPoster({ restaurant }: { restaurant: Restaurant }) {
  const { user } = useAuth();
  const { cards } = useLiveCards();
  const live = cards.find((c) => c.id === specialId(restaurant.id));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!user) return null;

  const post = async () => {
    if (!title.trim()) return;
    setBusy(true);
    setFailed(false);
    try {
      await postSpecial(restaurant.id, { title, body, image }, user.uid);
      setTitle("");
      setBody("");
      setImage("");
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface mt-3 rounded-3xl p-5">
      <h4 className="flex items-center gap-1.5 font-semibold text-ink-900 dark:text-white">
        <Flame size={16} className="text-root-500" /> Today&apos;s special
      </h4>

      {live ? (
        <div className="mt-3 rounded-2xl bg-root-50 p-3 dark:bg-root-500/10">
          <p className="font-semibold text-ink-900 dark:text-white">{live.title}</p>
          {live.body && <p className="text-sm text-ink-600 dark:text-ink-300">{live.body}</p>}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-ink-500 dark:text-ink-400">
              Live until{" "}
              {new Date(live.expiresAt!).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
            <button
              onClick={() => deleteCard(live.id).catch(() => setFailed(true))}
              className="inline-flex min-h-[36px] items-center gap-1 font-semibold text-root-600 dark:text-root-400"
            >
              <Trash2 size={14} /> Take down
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Post one and it shows on the home page and your listing for {SPECIAL_HOURS} hours.
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          post();
        }}
        className="mt-4 space-y-3"
      >
        <div>
          <Label htmlFor={`special-title-${restaurant.id}`}>{live ? "Replace with" : "What's on today"}</Label>
          <Input
            id={`special-title-${restaurant.id}`}
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fresh yellowfin, grilled to order"
          />
        </div>
        <div>
          <Label htmlFor={`special-body-${restaurant.id}`}>Details (optional)</Label>
          <Input
            id={`special-body-${restaurant.id}`}
            value={body}
            maxLength={200}
            onChange={(e) => setBody(e.target.value)}
            placeholder="MVR 180 with rice and salad, until it runs out"
          />
        </div>
        <div>
          <Label htmlFor={`special-image-${restaurant.id}`}>Photo URL (optional)</Label>
          <Input
            id={`special-image-${restaurant.id}`}
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://… (otherwise your listing photo)"
          />
        </div>
        <Button type="submit" disabled={busy || !title.trim()}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
          {live ? "Replace special" : "Post special"}
        </Button>
        {failed && (
          <p className="text-sm text-root-600 dark:text-root-400">
            That didn&apos;t go through. Check your connection and try again.
          </p>
        )}
      </form>
    </div>
  );
}
