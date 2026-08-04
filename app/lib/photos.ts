/**
 * Keyless restaurant photo lookup.
 *
 * Google blocks scripted image search outright (consent walls, JS-rendered
 * results, rapid IP bans), so there is no dependable keyless path to it. The
 * DuckDuckGo image endpoint is the closest working equivalent: it needs no API
 * key or account, and its index is broad enough to surface real photos of small
 * local venues. Everything is fetched server-side so no token or scraping
 * detail ever reaches the browser.
 *
 * Resolution order for a restaurant:
 *   1. DuckDuckGo image search for "<name> restaurant <location> Maldives"
 *   2. Same search without the location, for chains indexed under a plain name
 *   3. Both queries again against Bing, which indexes some small venues
 *      DuckDuckGo misses entirely
 *   4. A curated stock photo chosen deterministically from the cuisine
 *
 * Step 4 means a lookup never fails — a restaurant always renders a plausible
 * photo even when the network, or DuckDuckGo, is unavailable.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** How long a resolved result stays in the process cache. */
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

type Entry = { urls: string[]; expires: number };

const cache = new Map<string, Entry>();
/** De-duplicates concurrent lookups for the same query. */
const inflight = new Map<string, Promise<string[]>>();

/* -------------------------------------------------------------------------- */
/* Curated fallbacks                                                          */
/* -------------------------------------------------------------------------- */

const pexels = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

/** Stock sets keyed by cuisine, used only when a live lookup finds nothing. */
const FALLBACKS: Record<string, string[]> = {
  seafood: ["1435904", "262978", "725991", "1058277"],
  grill: ["1105325", "299347", "618775", "3535383"],
  steakhouse: ["1105325", "299347", "618775", "3535383"],
  japanese: ["357756", "2098085", "1148087", "1028427"],
  sushi: ["357756", "2098085", "1148087", "1028427"],
  indian: ["1640777", "2474661", "1624487", "941884"],
  curry: ["1640777", "2474661", "1624487", "941884"],
  thai: ["1213710", "699953", "2347311", "1640774"],
  asian: ["1213710", "699953", "2347311", "1640774"],
  "fast food": ["2338407", "60616", "1600711", "1639557"],
  burgers: ["1639557", "1600727", "70497", "2983101"],
  "fried chicken": ["2338407", "60616", "1600711", "2673353"],
  café: ["302899", "205961", "1055272", "851555"],
  cafe: ["302899", "205961", "1055272", "851555"],
  bakery: ["302899", "205961", "1055272", "461060"],
  brunch: ["1002740", "851555", "312418", "376464"],
  vegan: ["1092730", "1213710", "1640774", "1153655"],
  healthy: ["1092730", "1213710", "1640774", "1153655"],
  tapas: ["941869", "761854", "1267320", "1279330"],
  spanish: ["941869", "761854", "1267320", "1279330"],
  mediterranean: ["1279330", "958545", "70497", "1660030"],
  fusion: ["941861", "1279330", "1633578", "1267320"],
  international: ["262047", "1581384", "34099", "941861"],
  cocktails: ["262047", "1581384", "34099", "1283219"],
};

const GENERIC = ["262978", "67468", "1267320", "941861", "260922", "1058277"];

/** Stable non-negative hash, so a given restaurant always gets the same photo. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function fallbackUrls(name: string, cuisine: string[]): string[] {
  for (const c of cuisine) {
    const set = FALLBACKS[c.toLowerCase()];
    if (set) {
      // Rotate the set by the name hash so two Thai places don't look identical.
      const off = hash(name) % set.length;
      return set.map((_, i) => pexels(set[(i + off) % set.length]));
    }
  }
  const off = hash(name) % GENERIC.length;
  return GENERIC.map((_, i) => pexels(GENERIC[(i + off) % GENERIC.length]));
}

/* -------------------------------------------------------------------------- */
/* DuckDuckGo lookup                                                          */
/* -------------------------------------------------------------------------- */

/**
 * DuckDuckGo signs every search with a short-lived "vqd" token embedded in the
 * HTML page. The JSON endpoint rejects requests without it.
 */
async function getVqd(query: string, signal: AbortSignal): Promise<string | null> {
  const res = await fetch(
    `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
    { headers: { "User-Agent": UA, Accept: "text/html" }, signal }
  );
  if (!res.ok) return null;
  const html = await res.text();
  // The token appears in a few shapes depending on which bundle is served.
  const m =
    html.match(/vqd="([\w-]+)"/) ??
    html.match(/vqd=([\d-]+)&/) ??
    html.match(/vqd='([\w-]+)'/);
  return m?.[1] ?? null;
}

interface DdgResult {
  image?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

async function searchDdg(query: string, signal: AbortSignal): Promise<string[]> {
  const vqd = await getVqd(query, signal);
  if (!vqd) return [];

  const res = await fetch(
    `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(
      query
    )}&vqd=${vqd}&f=,,,&p=1`,
    {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        Referer: "https://duckduckgo.com/",
      },
      signal,
    }
  );
  if (!res.ok) return [];

  const data = (await res.json()) as { results?: DdgResult[] };
  return (data.results ?? [])
    // Skip icons, sprites and tiny thumbnails — they look broken in a card.
    .filter((r) => (r.width ?? 0) >= 500 && (r.height ?? 0) >= 350)
    .map((r) => r.image)
    .filter((u): u is string => typeof u === "string" && u.startsWith("https://"))
    .slice(0, 8);
}

/* -------------------------------------------------------------------------- */
/* Bing lookup                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Second opinion when DuckDuckGo comes back empty — different index, different
 * blind spots, and its results page still ships plain HTML to a normal
 * user-agent. Each result carries a JSON blob in an `m=` attribute whose `murl`
 * is the full-size original.
 */
async function searchBing(query: string, signal: AbortSignal): Promise<string[]> {
  const res = await fetch(
    `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`,
    {
      headers: {
        "User-Agent": UA,
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal,
    }
  );
  if (!res.ok) return [];

  const html = await res.text();
  const urls: string[] = [];
  // The blob is HTML-escaped inside the attribute, hence &quot; rather than ".
  const re = /&quot;murl&quot;:&quot;(https:\\?\/\\?\/[^&]+?)&quot;/g;
  for (const m of html.matchAll(re)) {
    const url = m[1].replace(/\\\//g, "/");
    if (/\.(jpe?g|png|webp)(\?|$)/i.test(url) && !urls.includes(url)) urls.push(url);
    if (urls.length >= 8) break;
  }
  return urls;
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Returns candidate photo URLs for a restaurant, best match first. Always
 * resolves to a non-empty array.
 */
export async function resolvePhotos(
  name: string,
  location = "",
  cuisine: string[] = []
): Promise<string[]> {
  const key = `${name}|${location}`.toLowerCase();

  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.urls;

  const running = inflight.get(key);
  if (running) return running;

  const task = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    let urls: string[] = [];
    try {
      const queries = [
        `${name} restaurant ${location} Maldives`.replace(/\s+/g, " ").trim(),
        `${name} restaurant Maldives`,
      ];
      outer: for (const engine of [searchDdg, searchBing]) {
        for (const q of queries) {
          try {
            urls = await engine(q, controller.signal);
          } catch {
            urls = [];
          }
          if (urls.length) break outer;
        }
      }
    } catch {
      // Network failure, timeout or a shape change upstream — fall through.
      urls = [];
    } finally {
      clearTimeout(timer);
    }

    if (!urls.length) urls = fallbackUrls(name, cuisine);

    cache.set(key, { urls, expires: Date.now() + TTL_MS });
    inflight.delete(key);
    return urls;
  })();

  inflight.set(key, task);
  return task;
}

/** Exposed for the route's own last-resort path. */
export { fallbackUrls };
