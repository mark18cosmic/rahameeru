import { NextRequest } from "next/server";
import { resolvePhotos, fallbackUrls } from "@/app/lib/photos";

export const runtime = "nodejs";
// Photos change rarely; let the platform cache the rendered bytes.
export const revalidate = 21600; // 6 hours

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const ONE_DAY = 60 * 60 * 24;

/** Neutral 1×1 so a hard failure degrades to empty space, never a broken icon. */
const BLANK = Buffer.from(
  "R0lGODlhAQABAIAAAOTk5AAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64"
);

/**
 * Proxies the upstream photo rather than redirecting to it. Several of the
 * hosts DuckDuckGo surfaces block hotlinking by Referer, and proxying also
 * keeps every image same-origin so `next/image` can optimise it without the
 * remote host needing to be allow-listed.
 */
async function fetchImage(url: string, signal: AbortSignal) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/*,*/*" },
    signal,
    redirect: "follow",
  });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  // Anything this small is a tracking pixel or an error placeholder.
  if (buf.byteLength < 2048) return null;
  return { buf, type };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const name = (sp.get("q") ?? "").slice(0, 120).trim();
  const location = (sp.get("loc") ?? "").slice(0, 80).trim();
  const cuisine = (sp.get("c") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
  const index = Math.max(0, Math.min(7, Number(sp.get("i") ?? 0) || 0));

  if (!name) {
    return new Response(BLANK, {
      headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const candidates = await resolvePhotos(name, location, cuisine);

    // Start at the requested index so a gallery gets distinct photos, then walk
    // the rest of the list — upstream hosts fail often enough to need retries.
    const ordered = [
      ...candidates.slice(index),
      ...candidates.slice(0, index),
      ...fallbackUrls(name, cuisine),
    ];

    for (const url of ordered.slice(0, 4)) {
      try {
        const img = await fetchImage(url, controller.signal);
        if (img) {
          return new Response(img.buf, {
            headers: {
              "Content-Type": img.type,
              "Cache-Control": `public, max-age=${ONE_DAY}, s-maxage=${ONE_DAY}, stale-while-revalidate=${ONE_DAY * 7}`,
            },
          });
        }
      } catch {
        // Try the next candidate.
      }
    }
  } catch {
    // Fall through to the blank response.
  } finally {
    clearTimeout(timer);
  }

  return new Response(BLANK, {
    headers: { "Content-Type": "image/gif", "Cache-Control": "public, max-age=300" },
  });
}
