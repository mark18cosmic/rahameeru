import type { Restaurant, OpeningHours, PriceLevel } from "./types";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function priceString(level: PriceLevel): string {
  return "$".repeat(level);
}

/** Returns true if the restaurant is open at the given date (defaults now). */
export function isOpenNow(hours: OpeningHours[] | undefined, now = new Date()): boolean {
  if (!hours || hours.length === 0) return false;
  const day = now.getDay();
  const today = hours.find((h) => h.day === day);
  if (!today) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = today.open.split(":").map(Number);
  const [ch, cm] = today.close.split(":").map(Number);
  const openM = oh * 60 + om;
  let closeM = ch * 60 + cm;
  if (closeM <= openM) closeM += 24 * 60; // overnight
  return mins >= openM && mins <= closeM;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function todayHoursLabel(hours: OpeningHours[] | undefined, now = new Date()): string {
  if (!hours) return "Hours unavailable";
  const today = hours.find((h) => h.day === now.getDay());
  if (!today) return "Closed today";
  if (today.open === "00:00" && today.close === "23:59") return "Open 24 hours";
  return `${DAY_NAMES[today.day]} · ${today.open} – ${today.close}`;
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** Deterministic-ish shuffle helper for the wheel. */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Photo source for a restaurant. Prefers an explicitly supplied image (a
 * Firestore doc can override), otherwise defers to /api/photo, which looks the
 * place up by name. `index` selects a different result for gallery slots.
 */
export function photoUrl(r: Restaurant, index = 0): string {
  if (index === 0 && r.image) return r.image;
  if (index > 0 && r.gallery?.[index]) return r.gallery[index];
  const params = new URLSearchParams({ q: r.name });
  if (r.location) params.set("loc", r.location);
  if (r.cuisine.length) params.set("c", r.cuisine.join(","));
  if (index) params.set("i", String(index));
  return `/api/photo?${params.toString()}`;
}

/**
 * The looked-up photo for a restaurant, deliberately ignoring whatever the
 * Firestore doc claims. Used as the recovery source when a stored URL fails to
 * load — plenty of the seeded Firebase links are dead or expired, and this is
 * what overrides them.
 */
export function apiPhotoUrl(r: Restaurant, index = 0): string {
  const params = new URLSearchParams({ q: r.name });
  if (r.location) params.set("loc", r.location);
  if (r.cuisine.length) params.set("c", r.cuisine.join(","));
  if (index) params.set("i", String(index));
  return `/api/photo?${params.toString()}`;
}

/**
 * Photo for a single dish, looked up by name through the same keyless endpoint
 * as restaurant photos. Scoped with the cuisine and the word "dish" because
 * "Sunrise" on its own returns hotels, not breakfast.
 */
export function dishPhotoUrl(
  dish: string,
  restaurantName: string,
  cuisine: string[] = []
): string {
  const params = new URLSearchParams({
    q: `${dish} dish ${cuisine[0] ?? ""}`.replace(/\s+/g, " ").trim(),
    loc: restaurantName,
  });
  if (cuisine.length) params.set("c", cuisine.join(","));
  return `/api/photo?${params.toString()}`;
}

/** Photo slots for the detail-page gallery. */
export function galleryUrls(r: Restaurant, count = 4): string[] {
  if (r.gallery?.length) return r.gallery.slice(0, count);
  return Array.from({ length: count }, (_, i) => photoUrl(r, i));
}

export function mapsUrl(r: Restaurant): string {
  if (r.coords) {
    return `https://www.google.com/maps/search/?api=1&query=${r.coords.lat},${r.coords.lng}`;
  }
  const q = encodeURIComponent(`${r.name} ${r.address ?? r.location} Maldives`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
