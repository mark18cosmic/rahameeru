"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Star,
  MessageSquareQuote,
  TrendingUp,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { Restaurant, Review } from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";
import { useVendor } from "@/app/lib/useVendor";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { getReviews, replyToReview } from "@/app/lib/reviews";
import { getVisits, dailySeries, type VisitDoc } from "@/app/lib/metrics";
import { setVendorPlan, PLAN_BY_ID, type PlanId } from "@/app/lib/vendor";
import { cx } from "@/app/lib/utils";
import { ChiliLoader } from "../ui/ChiliLoader";
import { PlanCards } from "./PlanCards";
import { ListingEditor } from "./ListingEditor";
import { ScanCode } from "./ScanCode";

function Sparkline({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-16 items-end gap-1">
      {data.map((d) => (
        <motion.div
          key={d.day}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          title={`${d.day}: ${d.count}`}
          className={cx(
            "flex-1 rounded-t",
            d.count > 0 ? "bg-root-500" : "bg-ink-100 dark:bg-ink-800"
          )}
        />
      ))}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <span className={cx("grid h-10 w-10 place-items-center rounded-2xl", tint)}>
        <Icon size={18} />
      </span>
      <p className="mt-3 font-display text-2xl font-extrabold text-ink-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}

export function VendorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { vendor, loading, refresh } = useVendor();
  const { restaurants } = useRestaurants();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [visits, setVisits] = useState<VisitDoc>({ total: 0, days: {} });
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [planPending, setPlanPending] = useState<PlanId | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySaving, setReplySaving] = useState(false);

  const owned: Restaurant[] = useMemo(
    () => restaurants.filter((r) => vendor?.restaurantIds.includes(r.id)),
    [restaurants, vendor]
  );

  const loadInsights = useCallback(async () => {
    if (!vendor || vendor.status !== "approved" || vendor.restaurantIds.length === 0) {
      setInsightsLoading(false);
      return;
    }
    const [reviewSets, visitDocs] = await Promise.all([
      Promise.all(vendor.restaurantIds.map((id) => getReviews(id))),
      Promise.all(vendor.restaurantIds.map((id) => getVisits(id))),
    ]);

    setReviews(
      reviewSets.flat().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    );
    // One chart across every listing they own.
    setVisits(
      visitDocs.reduce<VisitDoc>(
        (acc, v) => {
          acc.total += v.total;
          for (const [day, n] of Object.entries(v.days)) {
            acc.days[day] = (acc.days[day] ?? 0) + n;
          }
          return acc;
        },
        { total: 0, days: {} }
      )
    );
    setInsightsLoading(false);
  }, [vendor]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const sendReply = async (reviewId: string) => {
    if (!vendor || !replyText.trim()) return;
    setReplySaving(true);
    try {
      await replyToReview(reviewId, replyText, vendor.businessName);
      setReplyTo(null);
      setReplyText("");
      await loadInsights();
    } finally {
      setReplySaving(false);
    }
  };

  const choosePlan = async (id: PlanId) => {
    if (!vendor) return;
    setPlanPending(id);
    try {
      await setVendorPlan(vendor.uid, id);
      await refresh();
    } finally {
      setPlanPending(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="py-24">
        <ChiliLoader label="Opening your dashboard…" />
      </div>
    );
  }

  if (!user) {
    return (
      <Empty
        title="Sign in to continue"
        body="Your vendor dashboard is tied to the account you applied with."
        action={{ href: "/login?next=/vendor/dashboard", label: "Sign in" }}
      />
    );
  }

  if (!vendor) {
    return (
      <Empty
        title="No application yet"
        body="Claim your restaurant and we'll review it by hand — usually within a couple of days."
        action={{ href: "/vendor/signup", label: "Claim your restaurant" }}
      />
    );
  }

  const rated = reviews.length
    ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length
    : 0;
  const series = dailySeries(visits, 14);
  const last7 = series.slice(-7).reduce((n, d) => n + d.count, 0);
  const prev7 = series.slice(0, 7).reduce((n, d) => n + d.count, 0);
  const trend = prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-6 md:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white sm:text-3xl">
            {vendor.businessName}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {PLAN_BY_ID[vendor.plan]?.name ?? "Starter"} plan · applied{" "}
            {new Date(vendor.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusPill status={vendor.status} />
      </div>

      {vendor.status === "pending" && (
        <Notice
          tone="pending"
          icon={Clock}
          title="Application under review"
          body="A person checks every claim before a listing changes hands — a page carries other people's reviews, so we don't hand one over automatically. We'll email you at the address you applied with."
        />
      )}

      {vendor.status === "rejected" && (
        <Notice
          tone="rejected"
          icon={XCircle}
          title="We couldn't approve this claim"
          body={
            vendor.reviewNote ||
            "We weren't able to verify the connection between this account and the restaurant. Reply to our email with anything that proves it and we'll take another look."
          }
        />
      )}

      {vendor.status === "approved" && (
        <>
          <Notice
            tone="approved"
            icon={CheckCircle2}
            title="You're verified"
            body="Your listings are yours. Numbers below cover every restaurant on this account."
          />

          {insightsLoading ? (
            <div className="mt-8 flex items-center gap-2 text-ink-400">
              <Loader2 size={18} className="animate-spin" /> Loading insights…
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  icon={Eye}
                  label="Page visits, all time"
                  value={visits.total.toLocaleString()}
                  tint="bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300"
                />
                <Stat
                  icon={TrendingUp}
                  label="Last 7 days vs the 7 before"
                  value={`${trend >= 0 ? "+" : ""}${trend}%`}
                  tint="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                />
                <Stat
                  icon={Star}
                  label="Average from app reviews"
                  value={rated ? rated.toFixed(1) : "—"}
                  tint="bg-saffron-400/25 text-saffron-500"
                />
                <Stat
                  icon={MessageSquareQuote}
                  label="Reviews written in the app"
                  value={String(reviews.length)}
                  tint="bg-root-100 text-root-600 dark:bg-root-500/15 dark:text-root-300"
                />
              </div>

              <div className="mt-4 rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
                    Visits, last 14 days
                  </h2>
                  <span className="text-sm text-ink-400">{last7} this week</span>
                </div>
                <div className="mt-4">
                  <Sparkline data={series} />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-ink-400">
                  <span>{series[0]?.day.slice(5)}</span>
                  <span>{series[series.length - 1]?.day.slice(5)}</span>
                </div>
              </div>

              <div className="mt-4">
                <ScanCode
                  vendorUid={vendor.uid}
                  scanSecret={vendor.scanSecret}
                  restaurants={owned}
                  onSecret={refresh}
                />
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <section>
                  <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
                    Your listings
                  </h2>
                  {owned.length === 0 ? (
                    <p className="mt-3 rounded-3xl border border-dashed border-ink-200 p-5 text-sm text-ink-500 dark:border-ink-700">
                      No listing linked yet. We&apos;ll attach it when we approve
                      the match, or email us if it&apos;s missing.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {owned.map((r) => (
                        <div key={r.id}>
                          <ListingEditor restaurant={r} />
                          <Link
                            href={`/restaurant/${r.slug}`}
                            className="mt-1.5 inline-flex items-center gap-1 px-1 text-sm font-semibold text-root-600"
                          >
                            View public page <ExternalLink size={14} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
                    Latest reviews
                  </h2>
                  {reviews.length === 0 ? (
                    <p className="mt-3 rounded-3xl border border-dashed border-ink-200 p-5 text-sm text-ink-500 dark:border-ink-700">
                      Nothing written in the app yet.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {reviews.slice(0, 5).map((r) => (
                        <li
                          key={r.id}
                          className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-ink-800 dark:bg-ink-900"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-semibold text-ink-900 dark:text-white">
                              {r.name}
                            </p>
                            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-700 dark:text-ink-200">
                              <Star size={13} className="fill-saffron-500 text-saffron-500" />
                              {r.rating}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-3 text-sm text-ink-500">
                            {r.content}
                          </p>

                          {r.reply ? (
                            <p className="mt-2 rounded-xl bg-ink-50 p-2.5 text-sm text-ink-600 dark:bg-ink-800/60 dark:text-ink-300">
                              <span className="font-semibold">You replied: </span>
                              {r.reply.text}
                            </p>
                          ) : replyTo === r.id ? (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={2}
                                autoFocus
                                placeholder="Answer publicly, under their review."
                                className="w-full rounded-xl border border-ink-200 bg-transparent p-2.5 text-sm outline-none focus:border-root-400 dark:border-ink-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => sendReply(r.id)}
                                  disabled={replySaving || !replyText.trim()}
                                  className="flex min-h-[36px] items-center gap-1.5 rounded-full bg-root-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                  {replySaving && (
                                    <Loader2 size={13} className="animate-spin" />
                                  )}
                                  Post reply
                                </button>
                                <button
                                  onClick={() => setReplyTo(null)}
                                  className="min-h-[36px] rounded-full border border-ink-200 px-4 text-sm dark:border-ink-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReplyTo(r.id);
                                setReplyText("");
                              }}
                              className="mt-2 text-sm font-semibold text-root-600"
                            >
                              Reply
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </>
          )}
        </>
      )}

      <div className="mt-12">
        <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
          Your plan
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Switching is instant and free — billing isn&apos;t connected yet, so
          nothing is charged and no card is stored.
        </p>
        <div className="mt-5">
          <PlanCards current={vendor.plan} onChoose={choosePlan} pending={planPending} />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-saffron-400/20 text-saffron-500",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    rejected: "bg-root-100 text-root-700 dark:bg-root-900/25 dark:text-root-300",
    suspended: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
  };
  return (
    <span
      className={cx(
        "rounded-full px-3 py-1.5 text-sm font-semibold capitalize",
        map[status] ?? map.suspended
      )}
    >
      {status}
    </span>
  );
}

function Notice({
  tone,
  icon: Icon,
  title,
  body,
}: {
  tone: "pending" | "approved" | "rejected";
  icon: typeof Clock;
  title: string;
  body: string;
}) {
  const tones = {
    pending: "bg-saffron-400/15 text-saffron-500",
    approved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    rejected: "bg-root-50 text-root-600 dark:bg-root-900/20 dark:text-root-300",
  };
  return (
    <div className={cx("mt-6 flex items-start gap-3 rounded-3xl p-5", tones[tone])}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-ink-900 dark:text-white">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          {body}
        </p>
      </div>
    </div>
  );
}

function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: { href: string; label: string };
}) {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-2 text-ink-500">{body}</p>
      <Link
        href={action.href}
        className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-root-500 px-6 font-semibold text-white transition hover:bg-root-600 active:scale-[0.98]"
      >
        {action.label}
      </Link>
    </div>
  );
}
