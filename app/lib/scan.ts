/**
 * Scan on arrival.
 *
 * A vendor prints a QR code; a diner scans it with their phone's own camera,
 * which opens /scan/<restaurantId>?k=<code>. The code is derived from a secret
 * held on the vendor's record plus the calendar week, so a printed code has a
 * hard expiry and the restaurant reprints every Monday.
 *
 * The check is deliberately layered rather than clever:
 *   1. the code has to match this week's,
 *   2. the phone has to be near the restaurant if it will share a location,
 *   3. each person can claim a given week's code once, at each venue.
 *
 * Weekly rather than daily because a table tent nobody reprints is worse than
 * one that expires slightly less often: a day-long code meant reprinting every
 * morning, which no kitchen was going to do, and an un-reprinted code is a code
 * that no longer works. A week is short enough that a photo passed around a
 * group chat is worth little — each person can only claim it once anyway — and
 * long enough that reprinting is a Monday habit rather than a chore.
 *
 * None of this makes fraud impossible — someone standing outside with a photo
 * of a current code will get through. It makes it not worth the effort for the
 * size of the reward, which is the right bar.
 */

export const SCAN_POINTS = 8;
export const FIRST_SCAN_BONUS = 10;
/** Metres. Malé is dense, so this is generous rather than strict. */
export const SCAN_RADIUS_M = 250;
/** How long a scan counts as "I was there" when writing a review. */
export const VERIFIED_WINDOW_MS = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD in the viewer's own timezone; the Maldives has no DST. */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * ISO week key, e.g. "2026-W32". Weeks start Monday, which is when a
 * restaurant reprints.
 */
export function weekKey(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Thursday of the current week decides the year, per ISO 8601.
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Midnight on the Monday after the given date — when the code changes. */
export function weekExpiry(date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() + (7 - day));
  return d;
}

/**
 * The week's code for a restaurant. Runs in the browser (vendor dashboard) and
 * on the server (verification) — Web Crypto is available in both.
 */
export async function weekCode(
  secret: string,
  restaurantId: string,
  week = weekKey()
): Promise<string> {
  const data = new TextEncoder().encode(`${secret}:${restaurantId}:${week}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 5)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** A vendor's secret. Generated once, stored on their record. */
export function newScanSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Metres between two points. */
export function metresBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/**
 * Document id for one person's claim of one venue's code. Keyed by week, so a
 * code can be used once per person — passing it to a friend gains them one
 * claim they could have had anyway by turning up.
 */
export function scanDocId(uid: string, restaurantId: string, week = weekKey()) {
  return `${uid}_${restaurantId}_${week}`;
}
