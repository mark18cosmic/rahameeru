import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

/**
 * Ratings that move with real reviews without being hijacked by them.
 *
 * A plain average is wrong in both directions here. Listed ratings come with a
 * review count behind them, so a single 1★ from one user should not drag a
 * place with hundreds of reviews down to 3.0 — but the app also can't show a
 * frozen editorial number while people are actively rating.
 *
 * So: a Bayesian average. The listed rating acts as a prior weighted by its own
 * review count, capped at PRIOR_WEIGHT_CAP so that a handful of genuine reviews
 * still visibly move the number instead of drowning in a four-figure baseline.
 *
 *   rating = (w · listedRating + Σ userRatings) / (w + userCount)
 *   w      = clamp(listedCount, 1, PRIOR_WEIGHT_CAP)
 *
 * With no user reviews the result is exactly the listed rating.
 */
export const PRIOR_WEIGHT_CAP = 20;

export type ReviewStat = { count: number; sum: number };

/** Aggregate of the reviews collection, keyed by restaurant id. */
export type ReviewStats = Map<string, ReviewStat>;

let cache: { stats: ReviewStats; at: number } | null = null;
const TTL_MS = 60_000;

/**
 * One read of the whole reviews collection, aggregated in memory.
 *
 * Cheaper than a per-restaurant query on a list page, and it is the same data
 * the detail page would fetch anyway. Failures degrade to empty stats, which
 * leaves every listed rating untouched.
 */
export async function fetchReviewStats(force = false): Promise<ReviewStats> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return cache.stats;

  const stats: ReviewStats = new Map();
  try {
    const snap = await getDocs(collection(db, "reviews"));
    for (const doc of snap.docs) {
      const d = doc.data() as { restaurantId?: string; rating?: number };
      const id = d.restaurantId;
      const rating = Number(d.rating);
      // Guard against half-written docs and out-of-range values.
      if (!id || !Number.isFinite(rating) || rating < 1 || rating > 5) continue;
      const entry = stats.get(id) ?? { count: 0, sum: 0 };
      entry.count += 1;
      entry.sum += rating;
      stats.set(id, entry);
    }
  } catch {
    // Offline, blocked, or rules denied — fall back to listed ratings.
  }

  cache = { stats, at: Date.now() };
  return stats;
}

/** Drops the memoised aggregate so the next read reflects a just-posted review. */
export function invalidateReviewStats() {
  cache = null;
}

/** Blends a listed rating with live reviews. See the note at the top. */
export function blendRating(
  listedRating: number,
  listedCount: number,
  live: ReviewStat | undefined
): { rating: number; reviewCount: number } {
  const n = live?.count ?? 0;
  if (n === 0) return { rating: listedRating, reviewCount: listedCount };

  const weight = Math.min(Math.max(listedCount, 1), PRIOR_WEIGHT_CAP);
  const rating = (weight * listedRating + live!.sum) / (weight + n);

  return {
    // One decimal is all the UI shows; rounding here keeps sorting stable.
    rating: Math.round(rating * 10) / 10,
    reviewCount: listedCount + n,
  };
}
