"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { useAuth } from "@/app/providers/AuthProvider";

const KEY = "rahameeru.favorites";
const EVENT = "favorites-changed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(next: string[]) {
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Favourites, local-first and synced to the account when there is one.
 *
 * Local storage stays the read path so tapping a heart is instant and works
 * offline. When someone is signed in the list also lives on `users/{uid}`,
 * which is what makes it follow them to another device.
 *
 * The two copies are merged by union rather than last-write-wins: saving on
 * your phone and again on a laptop should end with both, and a device that has
 * been offline should never delete what another one added. The cost is that
 * un-saving something on a device that is offline gets undone by the next sync
 * — the right trade for a list whose whole purpose is not losing things.
 */
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const merged = useRef<string | null>(null);

  useEffect(() => {
    setFavorites(read());
    const sync = () => setFavorites(read());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const push = useCallback(
    (list: string[]) => {
      if (!user) return;
      setDoc(
        doc(db, "users", user.uid),
        { favorites: list, favoritesUpdatedAt: Date.now() },
        { merge: true }
      ).catch(() => {
        // Offline: the local copy is authoritative until the next write.
      });
    },
    [user]
  );

  // On sign-in, pull the account's list and merge it with whatever is on this
  // device. Runs once per account per mount.
  useEffect(() => {
    if (!user || merged.current === user.uid) return;
    merged.current = user.uid;

    let alive = true;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (!alive) return;
        const remote: string[] = snap.exists()
          ? (snap.data().favorites ?? []).filter(
              (x: unknown): x is string => typeof x === "string"
            )
          : [];
        const local = read();
        const union = Array.from(new Set([...remote, ...local]));

        if (union.length !== local.length) write(union);
        if (union.length !== remote.length) push(union);
      })
      .catch(() => {
        // Nothing to merge; carry on with the local list.
      });

    return () => {
      alive = false;
    };
  }, [user, push]);

  // A sign-out shouldn't leave the next person's list merged into this one.
  useEffect(() => {
    if (!user) merged.current = null;
  }, [user]);

  const toggle = useCallback(
    (id: string) => {
      const current = read();
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      write(next);
      push(next);
    },
    [push]
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return { favorites, toggle, isFavorite, synced: Boolean(user) };
}
