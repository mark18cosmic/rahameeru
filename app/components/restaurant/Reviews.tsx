"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  MessageSquarePlus,
  Loader2,
  CornerDownRight,
  Clock,
  Wallet,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  BadgeCheck,
} from "lucide-react";
import type { MenuSection, VisitType } from "@/app/lib/types";
import { blendRating } from "@/app/lib/ratings";
import { refreshRestaurants } from "@/app/lib/restaurants";
import { useReviews } from "@/app/lib/useReviews";
import { usePoints } from "@/app/lib/usePoints";
import { awardForReview } from "@/app/lib/rewards";
import { PointsToast } from "./PointsToast";
import { ReviewForm } from "./ReviewForm";
import { useAuth } from "@/app/providers/AuthProvider";
import { Stars } from "../ui/Stars";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

const VISIT_LABEL: Record<VisitType, { label: string; icon: typeof Clock }> = {
  "dine-in": { label: "Ate in", icon: UtensilsCrossed },
  takeaway: { label: "Takeaway", icon: ShoppingBag },
  delivery: { label: "Delivery", icon: Bike },
};

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  const units: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [secs, label] of units) {
    const v = Math.floor(s / secs);
    if (v >= 1) return `${v}${label} ago`;
  }
  return "just now";
}

export function Reviews({
  restaurantId,
  restaurantName,
  menu,
  autoOpen,
  onAutoOpened,
  baseCount,
  baseRating,
}: {
  restaurantId: string;
  restaurantName: string;
  /** Lets the form offer the actual dishes to rate. */
  menu?: MenuSection[];
  /** Opens the form on mount — set when arriving from a scan. */
  autoOpen?: boolean;
  onAutoOpened?: () => void;
  /** Listed review count, before anything posted in the app. */
  baseCount: number;
  /** Listed rating, before anything posted in the app. */
  baseRating: number;
}) {
  const { user } = useAuth();
  const { award } = usePoints();
  const { reviews, loading, refresh } = useReviews(restaurantId);
  const [earned, setEarned] = useState<{
    amount: number;
    lines: { label: string; amount: number }[];
  } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!autoOpen || !user) return;
    setOpen(true);
    onAutoOpened?.();
  }, [autoOpen, user, onAutoOpened]);

  const posted = async ({ contentLength }: { contentLength: number }) => {
    // Points are issued in the restaurant's name — see lib/rewards.ts.
    const earning = awardForReview({
      contentLength,
      isFirstForVendor: reviews.length === 0,
    });
    await award({
      restaurantId,
      restaurantName,
      amount: earning.amount,
      reason: `Reviewed ${restaurantName}`,
    });
    setEarned(earning);
    setOpen(false);
    // The list pages memoise their aggregate, so drop it — otherwise the rating
    // you just changed keeps showing the old number elsewhere.
    refreshRestaurants();
    refresh();
  };

  // Same Bayesian blend the listing pages use, recomputed from the reviews on
  // screen so posting one updates the header immediately.
  const live = reviews.length
    ? { count: reviews.length, sum: reviews.reduce((n, r) => n + r.rating, 0) }
    : undefined;
  const { rating: shownRating, reviewCount: communityCount } = blendRating(
    baseRating,
    baseCount,
    live
  );

  return (
    <div>
      <PointsToast earned={earned} onDone={() => setEarned(null)} />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
            Reviews
          </h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-ink-500">
            <Stars value={shownRating} size={16} />
            <span className="font-semibold text-ink-800 dark:text-ink-100">
              {shownRating.toFixed(1)}
            </span>
            <span>· {communityCount.toLocaleString()} reviews</span>
            {reviews.length > 0 && (
              <span className="text-ink-400">
                ({reviews.length} from the app)
              </span>
            )}
          </div>
        </div>
        {user ? (
          <Button onClick={() => setOpen(true)} size="sm">
            <MessageSquarePlus size={16} /> Write a review
          </Button>
        ) : (
          <Button onClick={() => (window.location.href = "/login")} variant="outline" size="sm">
            Sign in to review
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-ink-400">
            <Loader2 className="animate-spin" size={18} /> Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-200 py-12 text-center dark:border-ink-700">
            <p className="font-semibold text-ink-700 dark:text-ink-200">
              No community reviews yet
            </p>
            <p className="mt-1 text-sm text-ink-400">
              Be the first to share your experience.
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-root-100 font-bold text-root-600 dark:bg-root-900/30">
                    {r.name[0]?.toUpperCase()}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 font-semibold text-ink-900 dark:text-white">
                      {r.name}
                      {r.verifiedVisit && (
                        <span
                          title="Scanned the code at the restaurant"
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        >
                          <BadgeCheck size={11} /> Verified visit
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink-400">{timeAgo(r.createdAt)}</p>
                  </div>
                </div>
                <Stars value={r.rating} size={15} />
              </div>
              <p className="mt-3 text-ink-600 dark:text-ink-300">{r.content}</p>

              {r.photos && r.photos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {r.photos.map((src) => (
                    <a
                      key={src}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="relative h-24 w-24 overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="96px"
                        loading="lazy"
                        className="object-cover transition md:hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              )}

              {r.dishes && r.dishes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.dishes.map((d) => (
                    <span
                      key={d.name}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-1 text-[12px] text-ink-700 dark:bg-ink-800 dark:text-ink-200"
                    >
                      {d.name}
                      {typeof d.rating === "number" && (
                        <span className="font-semibold text-saffron-500">
                          {d.rating}/5
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {(r.visitType || r.waitMinutes || r.spendPerHead) && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                  {r.visitType && VISIT_LABEL[r.visitType] && (
                    <span className="flex items-center gap-1">
                      {(() => {
                        const Icon = VISIT_LABEL[r.visitType].icon;
                        return <Icon size={12} />;
                      })()}
                      {VISIT_LABEL[r.visitType].label}
                    </span>
                  )}
                  {typeof r.waitMinutes === "number" && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> waited {r.waitMinutes} min
                    </span>
                  )}
                  {typeof r.spendPerHead === "number" && (
                    <span className="flex items-center gap-1">
                      <Wallet size={12} /> MVR {r.spendPerHead} a head
                    </span>
                  )}
                </div>
              )}

              {r.reply && (
                <div className="mt-3 rounded-2xl bg-ink-50 p-3.5 dark:bg-ink-800/60">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 dark:text-ink-200">
                    <CornerDownRight size={13} className="text-root-500" />
                    {r.reply.by} replied
                    <span className="font-normal text-ink-400">
                      · {timeAgo(r.reply.at)}
                    </span>
                  </p>
                  <p className="mt-1.5 text-sm text-ink-600 dark:text-ink-300">
                    {r.reply.text}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Write a review"
        maxWidth="max-w-xl"
      >
        <div className="max-h-[70svh] overflow-y-auto pr-1">
          <ReviewForm
            restaurantId={restaurantId}
            menu={menu}
            onPosted={posted}
            onCancel={() => setOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
