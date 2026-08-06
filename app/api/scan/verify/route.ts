import { NextRequest } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import {
  dayCode,
  dayKey,
  metresBetween,
  SCAN_RADIUS_M,
} from "@/app/lib/scan";
import { getRestaurants } from "@/app/lib/restaurants";

/**
 * Checks a scanned code without ever handing the vendor's secret to the phone
 * doing the scanning.
 *
 * The secret lives on the vendor record; this route reads it, recomputes the
 * day's code and compares. Yesterday's code is also accepted, because a table
 * tent printed for "today" is still the right code at 00:20 to someone who
 * started dinner at 23:00.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Verdict =
  | { ok: true; restaurantId: string; restaurantName: string; slug: string }
  | { ok: false; reason: string };

async function vendorFor(restaurantId: string) {
  const snap = await getDocs(
    query(collection(db, "vendors"), where("restaurantIds", "array-contains", restaurantId))
  );
  const doc = snap.docs.find((d) => d.data().status === "approved");
  return doc?.data() as { scanSecret?: string; businessName?: string } | undefined;
}

export async function GET(req: NextRequest): Promise<Response> {
  const sp = req.nextUrl.searchParams;
  const restaurantId = (sp.get("r") ?? "").slice(0, 80);
  const code = (sp.get("k") ?? "").slice(0, 40).toLowerCase();
  // Number(null) is 0, which is a real coordinate in the Atlantic — check the
  // parameters are present before trusting them.
  const rawLat = sp.get("lat");
  const rawLng = sp.get("lng");
  const lat = rawLat === null ? NaN : Number(rawLat);
  const lng = rawLng === null ? NaN : Number(rawLng);

  const fail = (reason: string) =>
    Response.json({ ok: false, reason } satisfies Verdict, {
      headers: { "Cache-Control": "no-store" },
    });

  if (!restaurantId || !code) return fail("That code is incomplete.");

  const all = await getRestaurants();
  const restaurant = all.find((r) => r.id === restaurantId);
  if (!restaurant) return fail("We don't have that restaurant.");

  const vendor = await vendorFor(restaurantId);
  if (!vendor?.scanSecret) {
    return fail("This restaurant hasn't set up scanning yet.");
  }

  const today = await dayCode(vendor.scanSecret, restaurantId);
  const yesterday = await dayCode(
    vendor.scanSecret,
    restaurantId,
    dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000))
  );

  if (code !== today && code !== yesterday) {
    return fail("That code has expired. Ask for the current one.");
  }

  // Location is a check, not a requirement: browsers deny it often enough that
  // refusing the reward outright would punish the wrong people.
  if (Number.isFinite(lat) && Number.isFinite(lng) && restaurant.coords) {
    const distance = metresBetween({ lat, lng }, restaurant.coords);
    if (distance > SCAN_RADIUS_M) {
      return fail("You look too far away — scan the code at the restaurant.");
    }
  }

  return Response.json(
    {
      ok: true,
      restaurantId,
      restaurantName: restaurant.name,
      slug: restaurant.slug,
    } satisfies Verdict,
    { headers: { "Cache-Control": "no-store" } }
  );
}
