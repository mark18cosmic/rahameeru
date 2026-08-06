import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import type { Restaurant, PriceLevel } from "./types";
import { seedRestaurants } from "./data";
import { fetchReviewStats, blendRating, invalidateReviewStats } from "./ratings";
import { slugify } from "./utils";

/** Normalise a loosely-typed Firestore document into a Restaurant. */
function normalize(id: string, d: Record<string, any>): Restaurant {
  const name: string = d.name ?? d.label ?? "Unnamed";
  const priceLevel: PriceLevel =
    typeof d.priceLevel === "number"
      ? (Math.min(4, Math.max(1, d.priceLevel)) as PriceLevel)
      : (Math.min(4, Math.max(1, String(d.pricings ?? "$").length)) as PriceLevel);
  const rating = Number(d.rating ?? d.ratings ?? 0) || 0;
  const cuisine: string[] = Array.isArray(d.cuisine)
    ? d.cuisine
    : d.cuisine
      ? [d.cuisine]
      : [];
  const tags: string[] = Array.isArray(d.tags)
    ? d.tags
    : Array.isArray(d.badges)
      ? d.badges
      : [];
  return {
    id,
    slug: d.slug ?? slugify(name),
    name,
    cuisine,
    priceLevel,
    rating,
    reviewCount: Number(d.reviewCount ?? 0) || 0,
    baseRating: rating,
    baseReviewCount: Number(d.reviewCount ?? 0) || 0,
    description: d.description ?? d.desc ?? "",
    // Left undefined rather than "" so photoUrl() falls through to lookup.
    image: d.image || undefined,
    gallery: Array.isArray(d.gallery) ? d.gallery : undefined,
    location: d.location ?? "",
    address: d.address,
    coords: d.coords,
    tags,
    phone: d.phone,
    email: d.email,
    hours: d.hours,
    menu: Array.isArray(d.menu) ? d.menu : undefined,
    featured: Boolean(d.featured),
    createdAt: d.createdAt,
  };
}

let cache: Restaurant[] | null = null;

/**
 * The seed set on its own, blended with nothing and available synchronously.
 *
 * Pages render this on the first frame instead of a screen of skeletons, then
 * swap in the Firestore-merged list when it lands. The two are the same shape
 * and mostly the same content, so the swap is invisible beyond a few numbers
 * settling.
 */
export function getSeedRestaurants(): Restaurant[] {
  return seedRestaurants;
}

/** Cached list if one is already in memory, for a synchronous first paint. */
export function getCachedRestaurants(): Restaurant[] | null {
  return cache;
}

/**
 * Loads restaurants from Firestore, merged with the local seed set. Seed data
 * fills any gaps (and covers the case where Firestore is empty or blocked), so
 * the app always has content to show. Firestore docs win on slug collisions.
 */
export async function getRestaurants(): Promise<Restaurant[]> {
  if (cache) return cache;
  let remote: Restaurant[] = [];
  try {
    const snap = await getDocs(collection(db, "restaurants"));
    remote = snap.docs.map((doc) => normalize(doc.id, doc.data()));
  } catch {
    remote = [];
  }
  const bySlug = new Map<string, Restaurant>();
  for (const r of seedRestaurants) bySlug.set(r.slug, r);
  for (const r of remote) if (r.name) bySlug.set(r.slug, r);

  // Fold in what people have actually rated. One aggregate read covers the
  // whole list, so this costs the same whether it's a rail or the full grid.
  const stats = await fetchReviewStats();
  cache = Array.from(bySlug.values()).map((r) => {
    const base = {
      rating: r.baseRating ?? r.rating,
      count: r.baseReviewCount ?? r.reviewCount,
    };
    const blended = blendRating(base.rating, base.count, stats.get(r.id));
    return {
      ...r,
      baseRating: base.rating,
      baseReviewCount: base.count,
      ...blended,
    };
  });
  return cache;
}

/** Dispatched after a manual refresh so mounted hooks re-read the list. */
export const REFRESH_EVENT = "restaurants-refresh";

/** Forces the next read to re-query Firestore — call after posting a review. */
export function refreshRestaurants() {
  cache = null;
  invalidateReviewStats();
}

export async function getRestaurantBySlug(
  slug: string
): Promise<Restaurant | null> {
  const all = await getRestaurants();
  const target = slug.toLowerCase();
  return (
    all.find((r) => r.slug === target) ??
    all.find((r) => slugify(r.name) === target) ??
    null
  );
}

export function averageRating(restaurants: Restaurant[]): number {
  if (!restaurants.length) return 0;
  return (
    restaurants.reduce((s, r) => s + r.rating, 0) / restaurants.length
  );
}
