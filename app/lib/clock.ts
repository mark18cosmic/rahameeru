import type { OpeningHours } from "./types";

/**
 * Time, as the restaurants see it.
 *
 * Every listing's hours are Malé wall-clock times, so "now" is always read in
 * Maldives time (UTC+5, no daylight saving) rather than the device's zone. A
 * visitor whose phone is still on London time gets the same answers as
 * someone who lives here.
 */
const MALDIVES_OFFSET_MIN = 5 * 60;

/** A Date whose local getters (getHours, getDay…) read Malé wall-clock time. */
export function maldivesNow(at: number = Date.now()): Date {
  const local = new Date(at);
  return new Date(at + (local.getTimezoneOffset() + MALDIVES_OFFSET_MIN) * 60_000);
}

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

export type OpenState =
  | { kind: "open"; allDay: boolean; closesAt: string; closesInMin: number }
  | { kind: "opens-later"; opensAt: string; opensInMin: number }
  | { kind: "closed" };

/**
 * Where a place stands right now: open (and for how long), opening later
 * today, or done for the day.
 *
 * Handles kitchens that run past midnight from both sides: a 18:00 to 02:00
 * listing is open at 23:00 on its own day *and* at 01:00 the next morning,
 * which a check against today's row alone gets wrong.
 */
export function openState(hours: OpeningHours[] | undefined, now: Date): OpenState {
  if (!hours?.length) return { kind: "closed" };
  const mins = minutesOf(now);
  const day = now.getDay();

  // Last night's late shift still running?
  const yesterday = hours.find((h) => h.day === (day + 6) % 7);
  if (yesterday) {
    const o = toMinutes(yesterday.open);
    const c = toMinutes(yesterday.close);
    if (c < o && mins < c) {
      return { kind: "open", allDay: false, closesAt: yesterday.close, closesInMin: c - mins };
    }
  }

  const today = hours.find((h) => h.day === day);
  if (!today) return { kind: "closed" };
  if (today.open === "00:00" && today.close === "23:59") {
    return { kind: "open", allDay: true, closesAt: "23:59", closesInMin: 24 * 60 };
  }

  const o = toMinutes(today.open);
  let c = toMinutes(today.close);
  if (c <= o) c += 24 * 60;
  if (mins >= o && mins < c) {
    return { kind: "open", allDay: false, closesAt: today.close, closesInMin: c - mins };
  }
  if (mins < o) return { kind: "opens-later", opensAt: today.open, opensInMin: o - mins };
  return { kind: "closed" };
}

/** Short status for a card badge, or null when there is nothing worth saying. */
export function openLabel(state: OpenState): string | null {
  switch (state.kind) {
    case "open":
      if (state.allDay) return "Open 24 hours";
      if (state.closesInMin <= 60) return `Closes in ${state.closesInMin} min`;
      return `Open till ${state.closesAt}`;
    case "opens-later":
      return `Opens ${state.opensAt}`;
    default:
      return null;
  }
}

/** "2h 14m", "45m". */
export function formatSpan(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/* ------------------------------------------------------------- Ramadan */

export type Ramadan = {
  enabled: boolean;
  /** Iftar (sunset) in Malé, "HH:MM". Shifts a minute or so a day. */
  iftar: string;
  /** End of suhoor (dawn), "HH:MM". */
  suhoor: string;
  /** First day of the fast, "YYYY-MM-DD", for "Day 12". Optional. */
  startDate?: string;
};

/** Which day of Ramadan it is in Malé, or null without a start date. */
export function ramadanDay(now: Date, ramadan: Ramadan): number | null {
  if (!ramadan.startDate) return null;
  const [y, m, d] = ramadan.startDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  const start = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1;
  return day >= 1 && day <= 30 ? day : null;
}

/* ------------------------------------------------------------ dayparts */

/**
 * Which part of the day it is, for deciding what the home page leads with.
 * During Ramadan the day is shaped by the fast instead of by meals.
 */
export type Daypart =
  | "morning"
  | "lunch"
  | "afternoon"
  | "evening"
  | "late"
  | "fasting"
  | "iftar"
  | "suhoor";

export function daypartOf(now: Date, ramadan?: Ramadan): Daypart {
  const mins = minutesOf(now);
  if (ramadan?.enabled) {
    const iftar = toMinutes(ramadan.iftar);
    const suhoor = toMinutes(ramadan.suhoor);
    if (mins >= suhoor && mins < iftar) return "fasting";
    if (mins >= iftar && mins < 22 * 60) return "iftar";
    return "suhoor";
  }
  if (mins >= 5 * 60 && mins < 11 * 60) return "morning";
  if (mins >= 11 * 60 && mins < 15 * 60) return "lunch";
  if (mins >= 15 * 60 && mins < 18 * 60) return "afternoon";
  if (mins >= 18 * 60 && mins < 22 * 60) return "evening";
  return "late";
}

/** Minutes until a "HH:MM" time, wrapping past midnight. */
export function minutesUntil(hhmm: string, now: Date): number {
  const diff = toMinutes(hhmm) - minutesOf(now);
  return diff >= 0 ? diff : diff + 24 * 60;
}
