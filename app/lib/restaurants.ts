import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import type { Restaurant, PriceLevel } from "./types";
import { seedRestaurants } from "./data";
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
    description: d.description ?? d.desc ?? "",
    image: d.image ?? "",
    gallery: Array.isArray(d.gallery) ? d.gallery : undefined,
    location: d.location ?? "",
    address: d.address,
    coords: d.coords,
    tags,
    phone: d.phone,
    email: d.email,
    hours: d.hours,
    featured: Boolean(d.featured),
    createdAt: d.createdAt,
  };
}

let cache: Restaurant[] | null = null;

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
  cache = Array.from(bySlug.values());
  return cache;
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
