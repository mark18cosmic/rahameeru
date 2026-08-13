"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  X,
  Footprints,
  Car,
  LocateFixed,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { mapsUrl, cx } from "@/app/lib/utils";

type Mode = "foot" | "driving";

type RouteResult = {
  distance: number;
  duration: number;
  coordinates: [number, number][];
  straight: boolean;
  source: string;
};

function human(distance: number, duration: number): string {
  const mins = Math.max(1, Math.round(duration / 60));
  const dist =
    distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`;
  return `${mins} min · ${dist}`;
}

/**
 * Map and directions, built on Leaflet with OpenStreetMap tiles and an OSRM
 * route from /api/route — no key, no account, no quota anywhere in the chain.
 *
 * Leaflet is loaded on demand rather than imported at the top: it touches
 * `window` on import and it is 40 KB nobody needs until they tap Directions.
 */
export function MapModal({
  restaurant,
  open,
  onClose,
}: {
  restaurant: Restaurant;
  open: boolean;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const holder = useRef<HTMLDivElement>(null);
  const map = useRef<import("leaflet").Map | null>(null);
  const line = useRef<import("leaflet").Polyline | null>(null);
  const meMarker = useRef<import("leaflet").Marker | null>(null);

  const [mode, setMode] = useState<Mode>("foot");
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "routing" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const target = restaurant.coords;

  // Build the map once the sheet is open and the container has a size.
  useEffect(() => {
    if (!open || !target || map.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !holder.current) return;

      const instance = L.map(holder.current, {
        center: [target.lat, target.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(instance);

      L.control.zoom({ position: "bottomright" }).addTo(instance);

      // Inline SVG markers: Leaflet's defaults reference image files that need
      // asset config, and a div icon themes with the app for free.
      const pin = L.divIcon({
        className: "",
        html: `<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:#F84B3B;box-shadow:0 4px 14px rgba(0,0,0,.35);border:3px solid #fff">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M6 11v8M18 11v8"/></svg>
               </span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([target.lat, target.lng], { icon: pin })
        .addTo(instance)
        .bindPopup(`<b>${restaurant.name}</b><br>${restaurant.address ?? restaurant.location}`);

      map.current = instance;
      // The container was hidden a moment ago; Leaflet needs telling.
      setTimeout(() => instance.invalidateSize(), 120);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, target, restaurant.name, restaurant.address, restaurant.location]);

  // Tear the map down when the sheet closes, so reopening starts clean.
  useEffect(() => {
    if (open) return;
    map.current?.remove();
    map.current = null;
    line.current = null;
    meMarker.current = null;
    setRoute(null);
    setStatus("idle");
    setMessage(null);
  }, [open]);

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("This browser won't share a location.");
      return;
    }
    setStatus("locating");
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setStatus("error");
        setMessage("Location permission denied — you can still open the map.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Fetch and draw the route whenever we have both ends or the mode changes.
  useEffect(() => {
    if (!open || !me || !target || !map.current) return;
    let cancelled = false;

    (async () => {
      setStatus("routing");
      try {
        const res = await fetch(
          `/api/route?from=${me.lat},${me.lng}&to=${target.lat},${target.lng}&mode=${mode}`
        );
        const data = (await res.json()) as RouteResult;
        if (cancelled || !map.current) return;

        const L = (await import("leaflet")).default;

        line.current?.remove();
        line.current = L.polyline(data.coordinates, {
          color: "#F84B3B",
          weight: 5,
          opacity: 0.9,
          dashArray: data.straight ? "6 8" : undefined,
        }).addTo(map.current);

        meMarker.current?.remove();
        meMarker.current = L.marker([me.lat, me.lng], {
          icon: L.divIcon({
            className: "",
            html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        }).addTo(map.current);

        map.current.fitBounds(line.current.getBounds(), { padding: [40, 40] });
        setRoute(data);
        setStatus("idle");
        if (data.straight) {
          setMessage("Routing is unavailable, so this is a straight line.");
        } else {
          setMessage(null);
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Couldn't work out a route just now.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [me, mode, open, target]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-900/60" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-label={`Map for ${restaurant.name}`}
            initial={reduceMotion ? false : { y: "6%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: "5%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="clay relative flex h-[85svh] w-full flex-col overflow-hidden rounded-t-[2rem] sm:h-[600px] sm:max-w-2xl sm:rounded-[2rem]"
          >
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <h3 className="truncate font-display text-lg font-extrabold text-ink-900 dark:text-white">
                  {restaurant.name}
                </h3>
                <p className="truncate text-sm text-ink-500">
                  {restaurant.address ?? restaurant.location}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-600 active:scale-90 dark:bg-ink-800 dark:text-ink-200"
              >
                <X size={18} />
              </button>
            </div>

            {target ? (
              <>
                <div ref={holder} className="min-h-0 flex-1 bg-ink-100 dark:bg-ink-800" />

                <div className="border-t border-ink-100 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-ink-800 sm:pb-3">
                  {message && (
                    <p className="mb-2 flex items-start gap-2 rounded-xl bg-saffron-400/15 px-3 py-2 text-xs text-ink-600 dark:text-ink-300">
                      <AlertCircle size={14} className="mt-0.5 shrink-0 text-saffron-500" />
                      {message}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="flex rounded-full bg-ink-100 p-1 dark:bg-ink-800">
                      {(
                        [
                          ["foot", Footprints, "Walk"],
                          ["driving", Car, "Drive"],
                        ] as const
                      ).map(([key, Icon, label]) => (
                        <button
                          key={key}
                          onClick={() => setMode(key)}
                          className={cx(
                            "flex min-h-[38px] items-center gap-1.5 rounded-full px-3 text-sm font-medium transition",
                            mode === key
                              ? "bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-white"
                              : "text-ink-500"
                          )}
                        >
                          <Icon size={15} /> {label}
                        </button>
                      ))}
                    </div>

                    {route ? (
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900 dark:text-white">
                        {human(route.distance, route.duration)}
                      </p>
                    ) : (
                      <button
                        onClick={locate}
                        disabled={status === "locating"}
                        className="flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full bg-root-500 px-3 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-60"
                      >
                        {status === "locating" || status === "routing" ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <LocateFixed size={15} />
                        )}
                        Directions from me
                      </button>
                    )}

                    <a
                      href={mapsUrl(restaurant)}
                      target="_blank"
                      rel="noreferrer"
                      className="clay-sm clay-press grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full text-ink-600 dark:text-ink-300"
                      aria-label="Open in Google Maps"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <p className="text-ink-500">
                  We don&apos;t have coordinates for this one yet.
                </p>
                <a
                  href={mapsUrl(restaurant)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-root-500 px-5 font-semibold text-white"
                >
                  Search it on Google Maps <ExternalLink size={15} />
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
