/**
 * Scan on arrival.
 *
 * A vendor prints a QR code; a diner scans it with their phone's own camera,
 * which opens /scan/<restaurantId>?k=<code>. The code is derived from a secret
 * held on the vendor's record plus the calendar day, so a photo of the code
 * shared in a group chat stops working at midnight.
 *
 * The check is deliberately layered rather than clever:
 *   1. the code has to match today's (or yesterday's, for a late night),
 *   2. the phone has to be near the restaurant if it will share a location,
 *   3. one payout per person per venue per day.
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
 * The day's code for a restaurant. Runs in the browser (vendor dashboard) and
 * on the server (verification) — Web Crypto is available in both.
 */
export async function dayCode(
  secret: string,
  restaurantId: string,
  day = dayKey()
): Promise<string> {
  const data = new TextEncoder().encode(`${secret}:${restaurantId}:${day}`);
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

/** Document id for one person's scan of one venue on one day. */
export function scanDocId(uid: string, restaurantId: string, day = dayKey()) {
  return `${uid}_${restaurantId}_${day}`;
}
