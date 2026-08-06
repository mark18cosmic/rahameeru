import { NextRequest } from "next/server";

/**
 * Walking and driving directions, without an API key.
 *
 * OSRM is the routing engine. Two backends, in order:
 *
 *   1. `OSRM_URL` — a self-hosted instance (docker-compose.dev.yml runs one).
 *      The whole Maldives OSM extract is a few megabytes, so this is cheap to
 *      run and has no quota or terms attached.
 *   2. The public demo server, which is free but explicitly not for production
 *      use and makes no uptime promise. Fine as a fallback, not as the plan.
 *
 * If both fail the caller gets `straight: true` and a great-circle distance, so
 * the map can still draw something honest rather than nothing.
 */

export const runtime = "nodejs";
export const revalidate = 0;

const PUBLIC_OSRM = "https://router.project-osrm.org";
const TIMEOUT_MS = 6000;

type Point = { lat: number; lng: number };

function parsePoint(raw: string | null): Point | null {
  if (!raw) return null;
  const [lat, lng] = raw.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

/** Metres between two points, for the fallback and for sanity checks. */
function haversine(a: Point, b: Point): number {
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

type OsrmRoute = {
  distance: number;
  duration: number;
  geometry: { coordinates: [number, number][] };
};

async function fetchRoute(
  base: string,
  profile: string,
  from: Point,
  to: Point,
  signal: AbortSignal
): Promise<OsrmRoute | null> {
  const url =
    `${base}/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=geojson&alternatives=false&steps=false`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as { code?: string; routes?: OsrmRoute[] };
  if (data.code !== "Ok" || !data.routes?.length) return null;
  return data.routes[0];
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const from = parsePoint(sp.get("from"));
  const to = parsePoint(sp.get("to"));
  // Only the two profiles the app offers; anything else is a typo or a probe.
  const profile = sp.get("mode") === "driving" ? "driving" : "foot";

  if (!from || !to) {
    return Response.json({ error: "from and to are required as lat,lng" }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const bases = [process.env.OSRM_URL, PUBLIC_OSRM].filter(Boolean) as string[];

  try {
    for (const base of bases) {
      try {
        const route = await fetchRoute(base, profile, from, to, controller.signal);
        if (route) {
          return Response.json(
            {
              distance: Math.round(route.distance),
              duration: Math.round(route.duration),
              // [lng, lat] from GeoJSON, flipped to what Leaflet expects.
              coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
              straight: false,
              source: base === PUBLIC_OSRM ? "public" : "self-hosted",
            },
            { headers: { "Cache-Control": "public, max-age=300" } }
          );
        }
      } catch {
        // Try the next backend.
      }
    }
  } finally {
    clearTimeout(timer);
  }

  // Nothing answered: a straight line and a rough walking time at 1.35 m/s.
  const metres = haversine(from, to);
  return Response.json(
    {
      distance: Math.round(metres),
      duration: Math.round(metres / (profile === "driving" ? 8.3 : 1.35)),
      coordinates: [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
      straight: true,
      source: "estimate",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
