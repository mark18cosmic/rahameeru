"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  EMPTY_POINTS,
  applyAward,
  type PointsAward,
  type PointsState,
} from "./rewards";

const EVENT = "points-changed";

/**
 * The points ledger for the signed-in user, stored on their `users/{uid}` doc.
 *
 * Signed-in only, unlike favourites and diet: points are earned by reviewing,
 * and reviewing already requires an account. Nothing is kept for signed-out
 * visitors, so there's no anonymous balance to reconcile later.
 */
export function usePoints() {
  const { user } = useAuth();
  const [points, setPoints] = useState<PointsState>(EMPTY_POINTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setPoints(EMPTY_POINTS);
      setLoading(false);
      return;
    }
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const stored = snap.exists() ? (snap.data().points as PointsState) : null;
      setPoints(stored?.total !== undefined ? stored : EMPTY_POINTS);
    } catch {
      setPoints(EMPTY_POINTS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    const sync = () => load();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [load]);

  /** Adds an award and persists it. Returns the new total. */
  const award = useCallback(
    async (input: Omit<PointsAward, "at">) => {
      if (!user) return null;
      const next = applyAward(points, { ...input, at: Date.now() });
      setPoints(next);
      try {
        await setDoc(doc(db, "users", user.uid), { points: next }, { merge: true });
      } catch {
        // Kept in memory for this session; the next award will write both.
      }
      window.dispatchEvent(new Event(EVENT));
      return next;
    },
    [user, points]
  );

  return { points, award, loading, signedIn: Boolean(user) };
}
