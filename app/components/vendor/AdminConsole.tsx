"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Loader2,
  Mail,
  Phone,
  Search,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useVendor } from "@/app/lib/useVendor";
import { useRestaurants } from "@/app/lib/useRestaurants";
import {
  listVendors,
  setVendorStatus,
  claimRestaurant,
  type VendorProfile,
  type VendorStatus,
} from "@/app/lib/vendor";
import { cx } from "@/app/lib/utils";
import { ChiliLoader } from "../ui/ChiliLoader";

const FILTERS: { key: VendorStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

/**
 * Admin queue for vendor claims.
 *
 * Gated on an email allowlist in the environment, which decides what this
 * component offers — the real guard is the Firestore rules, since anything
 * client-side can be bypassed by anyone willing to open a console.
 */
export function AdminConsole({
  /** Set when rendered inside the admin console's own tabs, which already
      supply the page heading and padding. */
  embedded = false,
}: { embedded?: boolean } = {}) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: vendorLoading } = useVendor();
  const { restaurants } = useRestaurants();

  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<VendorStatus | "all">("pending");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setVendors(await listVendors());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return vendors
      .filter((v) => (filter === "all" ? true : v.status === filter))
      .filter((v) =>
        term
          ? `${v.businessName} ${v.contactName} ${v.email}`.toLowerCase().includes(term)
          : true
      );
  }, [vendors, filter, q]);

  const decide = async (v: VendorProfile, status: VendorStatus) => {
    setBusy(v.uid);
    try {
      await setVendorStatus(v.uid, status, note[v.uid]);
      // Approving is also what links the listing to the account.
      if (status === "approved") {
        for (const id of v.restaurantIds) {
          await claimRestaurant(v.uid, id, v.restaurantIds.filter((x) => x !== id));
        }
      }
      await load();
    } finally {
      setBusy(null);
    }
  };

  if (authLoading || vendorLoading) {
    return (
      <div className="py-24">
        <ChiliLoader label="Checking your access…" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-500 dark:bg-ink-800">
          <ShieldAlert size={24} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-900 dark:text-white">
          Admins only
        </h1>
        <p className="mt-2 text-ink-500">
          {user
            ? "This account isn't on the admin list."
            : "Sign in with an admin account to review vendor claims."}
        </p>
        {!user && (
          <Link
            href="/login?next=/admin"
            className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-root-500 px-6 font-semibold text-white transition hover:bg-root-600"
          >
            Sign in
          </Link>
        )}
      </div>
    );
  }

  const pendingCount = vendors.filter((v) => v.status === "pending").length;

  return (
    <div className={embedded ? "" : "mx-auto max-w-5xl px-5 py-8 md:px-6 md:py-12"}>
      {embedded ? (
        <p className="text-sm text-ink-500">
          {pendingCount} waiting on you · {vendors.length} total
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <span className="clay-on-color grid h-11 w-11 place-items-center rounded-2xl bg-ink-900 text-white dark:bg-white dark:text-ink-900">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white sm:text-3xl">
              Vendor claims
            </h1>
            <p className="text-sm text-ink-500">
              {pendingCount} waiting on you · {vendors.length} total
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cx(
              "min-h-[44px] rounded-full px-4 text-sm font-semibold transition",
              filter === f.key
                ? "clay-root"
                : "clay-sm clay-press text-ink-600 dark:text-ink-300"
            )}
          >
            {f.label}
            {f.key === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-white/25 px-1.5 text-xs">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
        <div className="relative ml-auto min-w-[200px] flex-1 sm:flex-none">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search claims"
            className="min-h-[40px] w-full clay-sm clay-press rounded-full bg-transparent pl-9 pr-3 text-sm outline-none focus:border-root-400 "
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-ink-400">
          <Loader2 size={18} className="animate-spin" /> Loading claims…
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-ink-200 p-10 text-center text-ink-500 dark:border-ink-700">
          Nothing here.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          <AnimatePresence initial={false}>
            {shown.map((v) => {
              const listings = restaurants.filter((r) => v.restaurantIds.includes(r.id));
              return (
                <motion.li
                  key={v.uid}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="clay rounded-[2rem] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
                        {v.businessName}
                      </h2>
                      <p className="text-sm text-ink-500">
                        {v.contactName} · applied{" "}
                        {new Date(v.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={cx(
                        "shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize",
                        v.status === "pending"
                          ? "bg-saffron-400/20 text-saffron-500"
                          : v.status === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-root-100 text-root-700 dark:bg-root-900/25 dark:text-root-300"
                      )}
                    >
                      {v.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-500">
                    <a href={`mailto:${v.email}`} className="flex items-center gap-1.5 hover:text-root-600">
                      <Mail size={14} /> {v.email}
                    </a>
                    <a href={`tel:${v.phone}`} className="flex items-center gap-1.5 hover:text-root-600">
                      <Phone size={14} /> {v.phone}
                    </a>
                  </div>

                  {v.about && (
                    <p className="clay-inset mt-3 rounded-2xl p-3 text-sm text-ink-600 dark:text-ink-300">
                      {v.about}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {listings.length > 0 ? (
                      listings.map((r) => (
                        <Link
                          key={r.id}
                          href={`/restaurant/${r.slug}`}
                          className="clay-sm clay-press rounded-full px-3 py-2 text-xs font-semibold text-ink-700 dark:text-ink-200"
                        >
                          {r.name} ↗
                        </Link>
                      ))
                    ) : (
                      <span className="rounded-full bg-saffron-400/15 px-3 py-1.5 text-xs font-medium text-saffron-500">
                        No listing linked
                      </span>
                    )}
                  </div>

                  {v.status === "pending" && (
                    <div className="mt-4 space-y-2">
                      <input
                        value={note[v.uid] ?? ""}
                        onChange={(e) =>
                          setNote((n) => ({ ...n, [v.uid]: e.target.value }))
                        }
                        placeholder="Note back to the applicant (shown if you reject)"
                        className="min-h-[44px] w-full clay-inset rounded-2xl px-4 text-sm outline-none focus:border-root-400 "
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => decide(v, "approved")}
                          disabled={busy === v.uid}
                          className="clay-on-color clay-press flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 font-semibold text-white disabled:opacity-60"
                        >
                          {busy === v.uid ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => decide(v, "rejected")}
                          disabled={busy === v.uid}
                          className="clay-sm clay-press flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full font-semibold text-ink-700 disabled:opacity-60 dark:text-ink-100"
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {v.status !== "pending" && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => decide(v, v.status === "approved" ? "suspended" : "approved")}
                        disabled={busy === v.uid}
                        className="clay-sm clay-press min-h-[44px] rounded-full px-4 text-sm font-semibold disabled:opacity-60"
                      >
                        {v.status === "approved" ? "Suspend" : "Approve now"}
                      </button>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
