/**
 * Points for reviewing.
 *
 * Points are issued in a restaurant's name and tracked per restaurant, because
 * that is how they are meant to be spent — a vendor decides what its own points
 * are worth. The app is the ledger, not the guarantor: nothing here creates an
 * offer a restaurant hasn't agreed to, and the UI says so wherever a balance
 * appears. Until a venue opts in, points are a record of what someone
 * contributed, and that is all they should be presented as.
 */

export type PointsAward = {
  /** Vendor the points belong to. */
  restaurantId: string;
  restaurantName: string;
  amount: number;
  reason: string;
  at: number;
};

export type PointsState = {
  total: number;
  /** Balance per vendor, keyed by restaurant id. */
  byVendor: Record<string, number>;
  /** Most recent awards, newest first. Capped — this is a feed, not an audit. */
  history: PointsAward[];
};

export const EMPTY_POINTS: PointsState = { total: 0, byVendor: {}, history: [] };

export const HISTORY_LIMIT = 20;

/** Base award for writing a review. */
export const REVIEW_POINTS = 10;
/** Extra for a review with enough detail to be useful to someone else. */
export const DETAIL_BONUS = 5;
export const DETAIL_MIN_CHARS = 140;
/** Extra for being the first person in the app to review a place. */
export const FIRST_REVIEW_BONUS = 15;

export type Tier = {
  name: string;
  at: number;
  chip: string;
};

/** Lifetime tiers, app-wide rather than per vendor. */
export const TIERS: Tier[] = [
  { name: "Newcomer", at: 0, chip: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300" },
  { name: "Regular", at: 50, chip: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  { name: "Local", at: 150, chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { name: "Critic", at: 400, chip: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { name: "Legend", at: 1000, chip: "bg-saffron-400/25 text-saffron-500" },
];

export function tierFor(total: number): { current: Tier; next: Tier | null; progress: number } {
  let current = TIERS[0];
  for (const t of TIERS) if (total >= t.at) current = t;
  const next = TIERS[TIERS.indexOf(current) + 1] ?? null;
  const span = next ? next.at - current.at : 1;
  const progress = next ? Math.min(1, (total - current.at) / span) : 1;
  return { current, next, progress };
}

/** What a review earns, and why — the breakdown is shown back to the user. */
export function awardForReview(input: {
  contentLength: number;
  isFirstForVendor: boolean;
}): { amount: number; lines: { label: string; amount: number }[] } {
  const lines = [{ label: "Review posted", amount: REVIEW_POINTS }];
  if (input.contentLength >= DETAIL_MIN_CHARS) {
    lines.push({ label: "Detailed write-up", amount: DETAIL_BONUS });
  }
  if (input.isFirstForVendor) {
    lines.push({ label: "First review here", amount: FIRST_REVIEW_BONUS });
  }
  return { amount: lines.reduce((n, l) => n + l.amount, 0), lines };
}

/** Applies an award to a ledger, returning a new one. */
export function applyAward(state: PointsState, award: PointsAward): PointsState {
  return {
    total: state.total + award.amount,
    byVendor: {
      ...state.byVendor,
      [award.restaurantId]: (state.byVendor[award.restaurantId] ?? 0) + award.amount,
    },
    history: [award, ...state.history].slice(0, HISTORY_LIMIT),
  };
}
