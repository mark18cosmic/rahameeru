"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Inbox,
  Mail,
  Trash2,
  Undo2,
  User as UserIcon,
} from "lucide-react";
import {
  deleteFeedback,
  setFeedbackHandled,
  watchFeedback,
  FEEDBACK_KINDS,
  type Feedback,
  type FeedbackKind,
} from "@/app/lib/feedback";
import { cx } from "@/app/lib/utils";

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "handled", label: "Handled" },
  { key: "all", label: "All" },
] as const;

type Filter = (typeof FILTERS)[number]["key"];

const KIND_LABEL: Record<FeedbackKind, string> = Object.fromEntries(
  FEEDBACK_KINDS.map((k) => [k.key, k.label])
) as Record<FeedbackKind, string>;

/** Anything that isn't a compliment gets the loud tint. */
const KIND_TINT: Record<FeedbackKind, string> = {
  idea: "clay-sm text-ink-600 dark:text-ink-300",
  problem: "clay-root",
  listing: "clay-saffron",
  praise: "clay-sm text-ink-600 dark:text-ink-300",
};

function when(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

/**
 * The feedback inbox.
 *
 * Live rather than fetched once: notes arrive while the console is open, and
 * an admin who leaves this tab up should see them without a refresh. Handling a
 * note keeps it — the record of what people asked for is the useful part — and
 * deleting is reserved for spam.
 */
export function FeedbackManager() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>("open");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(
    () =>
      watchFeedback(
        (next) => {
          setItems(next);
          setLoading(false);
          setFailed(false);
        },
        () => {
          setLoading(false);
          setFailed(true);
        }
      ),
    []
  );

  const shown = useMemo(
    () =>
      items.filter((f) =>
        filter === "all" ? true : filter === "handled" ? f.handled : !f.handled
      ),
    [items, filter]
  );

  const openCount = items.filter((f) => !f.handled).length;

  const act = async (id: string, fn: () => Promise<void>) => {
    setBusy(id);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cx(
              "min-h-[38px] rounded-full px-3.5 text-xs font-semibold transition",
              filter === f.key
                ? "clay-root"
                : "clay-sm clay-press text-ink-600 dark:text-ink-300"
            )}
          >
            {f.label}
            {f.key === "open" && openCount > 0 && ` · ${openCount}`}
          </button>
        ))}
      </div>

      {failed && (
        <p className="clay-inset mt-4 rounded-2xl p-3 text-sm text-ink-500 dark:text-ink-300">
          Couldn&apos;t read the feedback collection. If the production rules are
          deployed, make sure the <code className="font-mono text-xs">feedback</code>{" "}
          block is in them.
        </p>
      )}

      <p className="mt-4 text-sm text-ink-500">
        {loading ? "Loading…" : `${shown.length} ${shown.length === 1 ? "note" : "notes"}`}
      </p>

      {!loading && shown.length === 0 && (
        <div className="clay mt-3 rounded-[1.75rem] p-8 text-center">
          <span className="clay-sm mx-auto grid h-12 w-12 place-items-center rounded-2xl text-ink-400">
            <Inbox size={22} />
          </span>
          <p className="mt-3 text-sm text-ink-500">
            {filter === "open"
              ? "Nothing waiting. Everything sent in has been handled."
              : "No feedback here yet."}
          </p>
        </div>
      )}

      <div className="mt-3 space-y-3">
        {shown.map((f) => (
          <div
            key={f.id}
            className={cx(
              "clay rounded-[1.75rem] p-4 transition",
              f.handled && "opacity-70"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cx(
                  "rounded-full px-3 py-1 text-[11px] font-bold",
                  KIND_TINT[f.kind] ?? KIND_TINT.idea
                )}
              >
                {KIND_LABEL[f.kind] ?? f.kind}
              </span>
              <span className="text-xs text-ink-500">{when(f.createdAt)}</span>
              {f.page && (
                <Link
                  href={f.page}
                  className="clay-sm clay-press rounded-full px-2.5 py-1 text-[11px] font-medium text-ink-500 dark:text-ink-300"
                >
                  {f.page}
                </Link>
              )}
              {f.handled && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-400">
                  <Check size={12} /> Handled
                </span>
              )}
            </div>

            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-900 dark:text-ink-100">
              {f.message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <UserIcon size={13} />
                {f.userName ?? (f.userId ? "Signed-in user" : "Anonymous")}
              </span>
              {f.email && (
                <a
                  href={`mailto:${f.email}`}
                  className="inline-flex items-center gap-1.5 font-medium text-root-600 hover:underline"
                >
                  <Mail size={13} />
                  {f.email}
                </a>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                onClick={() =>
                  act(f.id, () => setFeedbackHandled(f.id, !f.handled))
                }
                disabled={busy === f.id}
                className={cx(
                  "inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition disabled:opacity-60",
                  f.handled
                    ? "clay-sm clay-press text-ink-600 dark:text-ink-300"
                    : "clay-root clay-press"
                )}
              >
                {f.handled ? <Undo2 size={13} /> : <Check size={13} />}
                {f.handled ? "Reopen" : "Mark handled"}
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this feedback for good?")) {
                    act(f.id, () => deleteFeedback(f.id));
                  }
                }}
                disabled={busy === f.id}
                className="clay-sm clay-press inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-root-600 disabled:opacity-60"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
