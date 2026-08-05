"use client";

import { doc, getDoc, increment, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

/**
 * Visit counts per restaurant.
 *
 * Kept as one document per restaurant with a map of day → count, which keeps a
 * vendor's dashboard to a single read and a page view to a single write. Not an
 * analytics product: it is deliberately coarse, has no identifiers in it, and
 * counts a person once per restaurant per browser session.
 */

export type VisitDoc = {
  total: number;
  /** "2026-08-05" → count. Only the last 60 days are worth reading. */
  days: Record<string, number>;
};

const SESSION_KEY = "rahameeru.seen";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function seenThisSession(id: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const seen: string[] = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]");
    if (seen.includes(id)) return true;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...seen, id]));
    return false;
  } catch {
    return false;
  }
}

/** Fire-and-forget: a failed count must never affect the page. */
export function recordVisit(restaurantId: string): void {
  if (!restaurantId || seenThisSession(restaurantId)) return;
  setDoc(
    doc(db, "metrics", restaurantId),
    { total: increment(1), days: { [today()]: increment(1) } },
    { merge: true }
  ).catch(() => {});
}

export async function getVisits(restaurantId: string): Promise<VisitDoc> {
  try {
    const snap = await getDoc(doc(db, "metrics", restaurantId));
    if (!snap.exists()) return { total: 0, days: {} };
    const d = snap.data() as Partial<VisitDoc>;
    return { total: d.total ?? 0, days: d.days ?? {} };
  } catch {
    return { total: 0, days: {} };
  }
}

/** Counts for the last `days` days, oldest first, with gaps filled as zero. */
export function dailySeries(visits: VisitDoc, days = 14): { day: string; count: number }[] {
  const out: { day: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, count: visits.days[key] ?? 0 });
  }
  return out;
}
