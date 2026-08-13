"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  MapPin,
  Trophy,
  MessageSquarePlus,
  LogIn,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { useAuth } from "@/app/providers/AuthProvider";
import { usePoints } from "@/app/lib/usePoints";
import { SCAN_POINTS, FIRST_SCAN_BONUS, weekKey, scanDocId } from "@/app/lib/scan";
import { ChiliLoader } from "../ui/ChiliLoader";

type State =
  | { status: "checking" }
  | { status: "signin" }
  | { status: "error"; message: string }
  | {
      status: "done";
      name: string;
      slug: string;
      earned: number;
      already: boolean;
    };

/**
 * What a scanned table code opens.
 *
 * The verification is server-side; this page's job is to be quick, to be clear
 * about what just happened, and to send someone onward to the thing worth doing
 * next — writing a review while the meal is still in front of them.
 */
export function ScanClaim({ restaurantId }: { restaurantId: string }) {
  const params = useSearchParams();
  const code = params.get("k") ?? "";
  const { user, loading: authLoading } = useAuth();
  const { award, points } = usePoints();
  const [state, setState] = useState<State>({ status: "checking" });
  const ran = useRef(false);

  const claim = useCallback(async () => {
    if (!user) return setState({ status: "signin" });

    // Position is optional — a denial shouldn't cost someone their points.
    const here = await new Promise<GeolocationPosition | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        resolve,
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );
    });

    const query = new URLSearchParams({ r: restaurantId, k: code });
    if (here) {
      query.set("lat", String(here.coords.latitude));
      query.set("lng", String(here.coords.longitude));
    }

    const res = await fetch(`/api/scan/verify?${query}`);
    const verdict = await res.json();

    if (!verdict.ok) {
      return setState({ status: "error", message: verdict.reason });
    }

    // One payout per person per venue per day; the id itself enforces it.
    const id = scanDocId(user.uid, restaurantId);
    const existing = await getDoc(doc(db, "scans", id));
    if (existing.exists()) {
      return setState({
        status: "done",
        name: verdict.restaurantName,
        slug: verdict.slug,
        earned: 0,
        already: true,
      });
    }

    const firstHere = (points.byVendor[restaurantId] ?? 0) === 0;
    const earned = SCAN_POINTS + (firstHere ? FIRST_SCAN_BONUS : 0);

    await setDoc(doc(db, "scans", id), {
      userId: user.uid,
      restaurantId,
      week: weekKey(),
      at: Date.now(),
    });

    await award({
      restaurantId,
      restaurantName: verdict.restaurantName,
      amount: earned,
      reason: `Visited ${verdict.restaurantName}`,
    });

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([15, 40, 15]);
    }

    setState({
      status: "done",
      name: verdict.restaurantName,
      slug: verdict.slug,
      earned,
      already: false,
    });
  }, [user, restaurantId, code, award, points]);

  useEffect(() => {
    if (authLoading || ran.current) return;
    if (!code) {
      setState({ status: "error", message: "That link is missing its code." });
      return;
    }
    ran.current = true;
    claim().catch(() =>
      setState({ status: "error", message: "Something went wrong. Try scanning again." })
    );
  }, [authLoading, code, claim]);

  if (state.status === "checking") {
    return (
      <div className="py-24">
        <ChiliLoader label="Checking you in…" />
      </div>
    );
  }

  if (state.status === "signin") {
    return (
      <Shell
        icon={<LogIn size={26} />}
        tone="neutral"
        title="Sign in to collect"
        body="Points are held against your account, so we need to know who you are. Sign in and scan again — it takes a moment."
      >
        <Link
          href={`/login?next=${encodeURIComponent(
            `/scan/${restaurantId}?k=${code}`
          )}`}
          className="inline-flex min-h-[50px] items-center rounded-full bg-root-500 px-6 font-semibold text-white"
        >
          Sign in
        </Link>
      </Shell>
    );
  }

  if (state.status === "error") {
    return (
      <Shell
        icon={<XCircle size={26} />}
        tone="bad"
        title="That didn't work"
        body={state.message}
      >
        <Link
          href="/explore"
          className="inline-flex min-h-[50px] items-center clay-sm clay-press rounded-full px-6 font-semibold "
        >
          Back to the app
        </Link>
      </Shell>
    );
  }

  return (
    <Shell
      icon={<CheckCircle2 size={26} />}
      tone="good"
      title={state.already ? "Already claimed this code" : `You're at ${state.name}`}
      body={
        state.already
          ? "Each code can be claimed once — the next goes up on Monday. Your review still counts, and it'll show as a verified visit."
          : "Verified from the code on your table. Write a review while it's in front of you and it'll carry a verified visit mark."
      }
    >
      {!state.already && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-saffron-400/20 px-4 py-2 font-display text-lg font-extrabold text-saffron-500"
        >
          <Trophy size={18} /> +{state.earned} points
        </motion.div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href={`/restaurant/${state.slug}?review=1`}
          className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-root-500 px-6 font-semibold text-white"
        >
          <MessageSquarePlus size={17} /> Write a review
        </Link>
        <Link
          href={`/restaurant/${state.slug}`}
          className="inline-flex min-h-[50px] items-center justify-center gap-2 clay-sm clay-press rounded-full px-6 font-semibold "
        >
          <MapPin size={17} /> See the menu
        </Link>
      </div>
    </Shell>
  );
}

function Shell({
  icon,
  tone,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  tone: "good" | "bad" | "neutral";
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  const tones = {
    good: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    bad: "bg-root-100 text-root-600 dark:bg-root-500/15 dark:text-root-300",
    neutral: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
  };
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${tones[tone]}`}>
        {icon}
      </span>
      <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-900 dark:text-white">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-ink-500">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
