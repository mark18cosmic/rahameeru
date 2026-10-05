"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS, watchSiteSettings, type SiteSettings } from "./admin";

/*
 * The site settings document, watched once for the whole app. The home page,
 * every restaurant list (for Ramadan hours) and the restaurant page all need
 * it, and each opening its own Firestore listener would be wasteful.
 */
let current: SiteSettings = DEFAULT_SETTINGS;
let stop: (() => void) | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!stop) {
    stop = watchSiteSettings((s) => {
      current = s;
      listeners.forEach((l) => l());
    });
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && stop) {
      stop();
      stop = null;
    }
  };
}

export function useSiteSettings(): SiteSettings {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => DEFAULT_SETTINGS
  );
}
