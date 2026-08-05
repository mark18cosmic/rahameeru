"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { useAuth } from "@/app/providers/AuthProvider";
import type { DietKey } from "./diet";

const KEY = "rahameeru.diet";
const EVENT = "diet-changed";

function read(): DietKey[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? (parsed as DietKey[]) : [];
  } catch {
    return [];
  }
}

function write(next: DietKey[]) {
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

/**
 * A person's allergens and dietary choices.
 *
 * Local storage is the source of truth for reads so the menu can flag dishes
 * instantly and while offline — this is safety-adjacent information and it
 * should never be waiting on a network round trip. When someone is signed in it
 * also mirrors to `users/{uid}`, so the list survives a new phone, and that
 * copy wins on first load.
 */
export function usePreferences() {
  const { user } = useAuth();
  const [diet, setDiet] = useState<DietKey[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDiet(read());
    setLoaded(true);
    const sync = () => setDiet(read());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  // Pull the signed-in copy once, and only when the device has nothing set —
  // otherwise a fresh sign-in on a phone would wipe what's on that phone.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (!alive || !snap.exists()) return;
        const remote = snap.data().diet;
        if (Array.isArray(remote) && remote.length && read().length === 0) {
          write(remote as DietKey[]);
        }
      })
      .catch(() => {
        // Offline or rules denied — the local copy still works.
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const persist = useCallback(
    (next: DietKey[]) => {
      write(next);
      if (user) {
        setDoc(
          doc(db, "users", user.uid),
          { diet: next, updatedAt: Date.now() },
          { merge: true }
        ).catch(() => {
          // Keep the local change; the next save will retry.
        });
      }
    },
    [user]
  );

  const toggle = useCallback(
    (key: DietKey) => {
      const current = read();
      persist(
        current.includes(key)
          ? current.filter((k) => k !== key)
          : [...current, key]
      );
    },
    [persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { diet, toggle, clear, loaded, synced: Boolean(user) };
}
