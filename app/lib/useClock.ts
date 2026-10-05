"use client";

import { useSyncExternalStore } from "react";
import { maldivesNow } from "./clock";

/*
 * One shared ticker for every component that shows the time of day. Cards
 * each subscribing their own interval would mean dozens of timers on the home
 * page; this keeps one, and stops it when nothing is listening.
 */
let current: Date | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    current = maldivesNow();
    timer = setInterval(() => {
      current = maldivesNow();
      listeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/**
 * Malé time, refreshed every 30 seconds. Null on the server and during
 * hydration: pages are pre-rendered at build time, so any clock reading in
 * the HTML would be the build machine's, not the visitor's.
 */
export function useNow(): Date | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null
  );
}
