"use client";

import { useEffect, useState } from "react";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/app/firebase/firebaseConfig";

/**
 * A named, shareable list of places: "Best brunch in Hulhumalé", "Where to
 * take visitors". Anyone with the link can read one; only its owner edits it.
 * Favourites stay as they are (private, one per person); a list is the
 * public, curated version.
 */
export type PlaceList = {
  id: string;
  title: string;
  description: string;
  restaurantIds: string[];
  ownerId: string;
  ownerName: string;
  createdAt: number;
  updatedAt: number;
};

/** Mirrored in the Firestore rules. */
export const MAX_LIST = 50;
export const MAX_TITLE = 80;
export const MAX_DESCRIPTION = 280;

const lists = () => collection(db, "lists");

export async function createList(
  user: User,
  { title, description = "", restaurantIds = [] }: { title: string; description?: string; restaurantIds?: string[] }
): Promise<string> {
  const ref = doc(lists());
  await setDoc(ref, {
    title: title.trim().slice(0, MAX_TITLE),
    description: description.trim().slice(0, MAX_DESCRIPTION),
    restaurantIds: restaurantIds.slice(0, MAX_LIST),
    ownerId: user.uid,
    ownerName: user.displayName?.split(" ")[0] || "A Decide.mv regular",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return ref.id;
}

export function updateList(
  id: string,
  patch: Partial<Pick<PlaceList, "title" | "description" | "restaurantIds">>
) {
  return updateDoc(doc(db, "lists", id), { ...patch, updatedAt: Date.now() });
}

export function addToList(id: string, restaurantId: string) {
  return updateDoc(doc(db, "lists", id), {
    restaurantIds: arrayUnion(restaurantId),
    updatedAt: Date.now(),
  });
}

export function removeFromList(id: string, restaurantId: string) {
  return updateDoc(doc(db, "lists", id), {
    restaurantIds: arrayRemove(restaurantId),
    updatedAt: Date.now(),
  });
}

export function deleteList(id: string) {
  return deleteDoc(doc(db, "lists", id));
}

export function watchList(
  id: string,
  onChange: (list: PlaceList | null) => void,
  onError: () => void
): () => void {
  return onSnapshot(
    doc(db, "lists", id),
    (snap) => onChange(snap.exists() ? ({ id: snap.id, ...snap.data() } as PlaceList) : null),
    onError
  );
}

/**
 * The signed-in user's lists, newest edit first. Sorted here rather than in
 * the query, which would need a composite index for one small result set.
 */
export function useMyLists(user: User | null) {
  const [mine, setMine] = useState<PlaceList[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setMine([]);
      setReady(true);
      return;
    }
    setReady(false);
    return onSnapshot(
      query(lists(), where("ownerId", "==", user.uid)),
      (snap) => {
        setMine(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as PlaceList)
            .sort((a, b) => b.updatedAt - a.updatedAt)
        );
        setReady(true);
      },
      () => setReady(true)
    );
  }, [user]);

  return { lists: mine, ready };
}
