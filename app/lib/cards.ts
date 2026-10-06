"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

/**
 * Content cards on the home page, from two sources in one shape:
 *
 * - guides, written by an admin and pointing anywhere (a list, a restaurant,
 *   a search);
 * - specials, posted by a restaurant's owner for that restaurant and gone
 *   after a day.
 *
 * A restaurant has at most one special at a time: it lives at a fixed id,
 * so posting a new one replaces the old rather than piling up.
 */
export type ContentCard = {
  id: string;
  kind: "guide" | "special";
  title: string;
  body?: string;
  /** Explicit image. Specials fall back to the restaurant's photo. */
  image?: string;
  /** In-app path the card opens. Specials open their restaurant. */
  href?: string;
  restaurantId?: string;
  /** Guides are shown in this order, before any specials. */
  order: number;
  active: boolean;
  createdAt: number;
  /** Specials only: hidden after this moment. */
  expiresAt?: number;
  authorId: string;
};

export const SPECIAL_HOURS = 24;
export const specialId = (restaurantId: string) => `special-${restaurantId}`;

const cards = () => collection(db, "cards");

/** Guides first (in their set order), then specials newest first. */
export function sortCards(all: ContentCard[], now = Date.now()): ContentCard[] {
  const live = all.filter((c) => c.active && (!c.expiresAt || c.expiresAt > now));
  const guides = live.filter((c) => c.kind === "guide").sort((a, b) => a.order - b.order);
  const specials = live.filter((c) => c.kind === "special").sort((a, b) => b.createdAt - a.createdAt);
  return [...guides, ...specials];
}

/** Every card, including drafts and expired specials (the admin view). */
export function useAllCards() {
  const [all, setAll] = useState<ContentCard[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(
    () =>
      onSnapshot(
        cards(),
        (snap) => {
          setAll(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ContentCard));
          setReady(true);
        },
        () => setReady(true)
      ),
    []
  );
  return { all, ready };
}

/** What diners see: live cards only, in display order. */
export function useLiveCards() {
  const { all, ready } = useAllCards();
  return { cards: sortCards(all), ready };
}

export async function saveGuide(
  card: Omit<ContentCard, "id" | "kind" | "createdAt" | "authorId">,
  authorId: string,
  id?: string
): Promise<string> {
  const ref = id ? doc(db, "cards", id) : doc(cards());
  await setDoc(
    ref,
    {
      ...clean(card),
      kind: "guide",
      authorId,
      ...(id ? {} : { createdAt: Date.now() }),
    },
    { merge: true }
  );
  return ref.id;
}

export function postSpecial(
  restaurantId: string,
  { title, body, image }: { title: string; body?: string; image?: string },
  authorId: string
) {
  const now = Date.now();
  return setDoc(doc(db, "cards", specialId(restaurantId)), {
    ...clean({ title: title.trim().slice(0, 80), body: body?.trim().slice(0, 200), image: image?.trim() }),
    kind: "special",
    restaurantId,
    order: 0,
    active: true,
    createdAt: now,
    expiresAt: now + SPECIAL_HOURS * 60 * 60 * 1000,
    authorId,
  });
}

export function deleteCard(id: string) {
  return deleteDoc(doc(db, "cards", id));
}

/** Firestore rejects undefined fields, and an empty string is not a value. */
function clean<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== "")
  ) as Partial<T>;
}
