"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Link2, Pencil, RotateCw, Users, X } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  loadMe,
  saveMe,
  saveSpin,
  setName,
  setVetoes,
  watchGroupWheel,
  type GroupWheel as Wheel,
  type Me,
} from "@/app/lib/groupWheel";
import { cx, priceString } from "@/app/lib/utils";
import { Photo } from "../ui/Photo";
import { Button, ButtonLink } from "../ui/Button";
import { ChiliLoader } from "../ui/ChiliLoader";
import { SPIN_MS, targetRotation, usePaintWheel } from "./wheelCanvas";

type State = { status: "loading" } | { status: "missing" } | { status: "error" } | { status: "ready"; wheel: Wheel };

export function GroupWheel({ id }: { id: string }) {
  const { user } = useAuth();
  const { restaurants } = useRestaurants();
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<State>({ status: "loading" });
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    setMe(loadMe(user?.displayName?.split(" ")[0]));
  }, [user]);

  useEffect(
    () =>
      watchGroupWheel(
        id,
        (wheel) => setState(wheel ? { status: "ready", wheel } : { status: "missing" }),
        () => setState({ status: "error" })
      ),
    [id]
  );

  const wheel = state.status === "ready" ? state.wheel : null;

  // Joining is just putting your name on the wheel. If someone else on this
  // wheel already goes by it, take the next free variant ("Guest 4 2"), so
  // vetoes are never ambiguous about who made them.
  useEffect(() => {
    if (!wheel || !me) return;
    const taken = Object.entries(wheel.names)
      .filter(([pid]) => pid !== me.id)
      .map(([, name]) => name);
    if (taken.includes(me.name)) {
      let k = 2;
      while (taken.includes(`${me.name} ${k}`)) k++;
      const next = { ...me, name: `${me.name} ${k}` };
      saveMe(next);
      setMe(next);
      return;
    }
    if (wheel.names[me.id] !== me.name) setName(id, me).catch(() => {});
  }, [wheel, me, id]);

  const byId = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), [restaurants]);
  const pool = useMemo(
    () => (wheel?.poolIds ?? []).map((rid) => byId.get(rid)).filter(Boolean) as Restaurant[],
    [wheel?.poolIds, byId]
  );

  /** Restaurant id to the names of everyone who ruled it out. */
  const vetoedBy = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const [pid, ids] of Object.entries(wheel?.vetoes ?? {})) {
      for (const rid of ids) map.set(rid, [...(map.get(rid) ?? []), wheel?.names[pid] ?? "Someone"]);
    }
    return map;
  }, [wheel]);

  const active = useMemo(() => pool.filter((r) => !vetoedBy.has(r.id)), [pool, vetoedBy]);
  const mine = (me && wheel?.vetoes[me.id]) || [];

  /* ------------------------------------------------------- spin, shared */

  const result = wheel?.result;
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const firstResult = useRef(true);

  // Every viewer reacts to the stored result, including whoever spun it, so
  // all of them run the same animation to the same slice.
  useEffect(() => {
    if (!result) return;
    // A result that was already there when the page opened is shown in place;
    // replaying a spin from minutes ago would look like a new one.
    const stale = firstResult.current && Date.now() - result.at > SPIN_MS;
    firstResult.current = false;
    setRotation(result.rotation);
    if (stale || reduceMotion) {
      setSpinning(false);
      setRevealed(result.winnerId);
      return;
    }
    setSpinning(true);
    setRevealed(null);
    const t = setTimeout(() => {
      setSpinning(false);
      setRevealed(result.winnerId);
      navigator.vibrate?.([20, 40, 20]);
    }, SPIN_MS);
    return () => clearTimeout(t);
  }, [result?.at]); // eslint-disable-line react-hooks/exhaustive-deps

  // While a spin is on screen, the wheel shows the pool it was drawn from;
  // otherwise it shows what's left after the current vetoes.
  const showingResultPool = Boolean(result) && (spinning || sameSet(result!.ids, active.map((r) => r.id)));
  const wheelIds = showingResultPool ? result!.ids : active.map((r) => r.id);
  const names = useMemo(
    () => wheelIds.map((rid) => byId.get(rid)?.name ?? "?"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wheelIds.join("|"), byId]
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 300;
  usePaintWheel(canvasRef, names, size);

  const spin = () => {
    if (!wheel || !me || spinning || active.length === 0) return;
    navigator.vibrate?.(15);
    const winIndex = Math.floor(Math.random() * active.length);
    saveSpin(id, {
      ids: active.map((r) => r.id),
      winnerId: active[winIndex].id,
      rotation: targetRotation(result?.rotation ?? 0, active.length, winIndex, {
        turns: 6,
        jitter: Math.random() - 0.5,
      }),
      at: Date.now(),
      by: me.name,
    }).catch(() => setState({ status: "error" }));
  };

  const toggleVeto = (rid: string) => {
    if (!me) return;
    const next = mine.includes(rid) ? mine.filter((x) => x !== rid) : [...mine, rid];
    setVetoes(id, me.id, next).catch(() => {});
  };

  /* ---------------------------------------------------------------- views */

  if (state.status === "loading" || !me) {
    return <ChiliLoader label="Finding the wheel…" className="py-24" />;
  }
  if (state.status === "missing" || state.status === "error") {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          {state.status === "missing" ? "This wheel isn't here" : "Couldn't reach the wheel"}
        </h1>
        <p className="mt-2 text-ink-500 dark:text-ink-400">
          {state.status === "missing"
            ? "The link may be mistyped, or the wheel was never saved."
            : "Check your connection and try again."}
        </p>
        <ButtonLink href="/#wheel" className="mt-6">
          Start a new wheel
        </ButtonLink>
      </div>
    );
  }

  const people = Object.entries(wheel!.names);
  const winner = revealed ? byId.get(revealed) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 md:px-6 md:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white md:text-5xl">
            Decide together
          </h1>
          <p className="mt-2 max-w-lg text-ink-500 dark:text-ink-400">
            Everyone with the link can rule places out. Anyone can spin, and
            everyone sees the same result.
          </p>
        </div>
        <ShareButton />
      </div>

      <People people={people} me={me} onRename={(name) => {
        const next = { ...me, name };
        saveMe(next);
        setMe(next);
      }} />

      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-start">
        {/* The wheel, and what it landed on */}
        <div className="flex flex-col items-center gap-4 md:sticky md:top-24">
          <div className="relative" style={{ width: size, height: size }}>
            <div className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2">
              <div className="h-0 w-0 border-x-[12px] border-t-[20px] border-x-transparent border-t-ink-900 dark:border-t-white" />
            </div>
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: spinning && !reduceMotion ? SPIN_MS / 1000 : 0, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: size, height: size }}
            >
              <canvas ref={canvasRef} style={{ width: size, height: size }} aria-hidden />
            </motion.div>
            {wheelIds.length === 0 && (
              <div className="absolute inset-0 grid place-items-center text-center text-sm text-ink-500 dark:text-ink-300">
                <span className="well rounded-2xl px-5 py-3">
                  Every place has been vetoed.
                  <br />
                  Someone has to give.
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-ink-500 dark:text-ink-400" aria-live="polite">
            {spinning
              ? `${result?.by} spun the wheel…`
              : `${active.length} of ${pool.length} places still in`}
          </p>

          <Button onClick={spin} disabled={spinning || active.length === 0} size="lg" className="w-full max-w-xs">
            <RotateCw size={18} className={spinning ? "animate-spin" : ""} />
            {result ? "Spin again" : "Spin"}
          </Button>

          <AnimatePresence>
            {winner && !spinning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="well flex w-full max-w-sm items-center gap-3 rounded-2xl p-3"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                  <Photo r={winner} sizes="56px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-root-600 dark:text-root-400">
                    {result?.by} spun, and it&apos;s
                  </span>
                  <span className="block truncate font-bold text-ink-900 dark:text-white">{winner.name}</span>
                  <span className="block truncate text-xs text-ink-500 dark:text-ink-400">
                    {priceString(winner.priceLevel)} · {winner.location}
                  </span>
                </span>
                <ButtonLink href={`/restaurant/${winner.slug}`} size="sm" className="shrink-0">
                  Go <ArrowRight size={14} />
                </ButtonLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The places, with vetoes */}
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">On the wheel</h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Tap Veto on anywhere you&apos;d rather not go tonight.
          </p>
          <ul className="mt-3 divide-y divide-[var(--line)]">
            {pool.map((r) => {
              const by = vetoedBy.get(r.id) ?? [];
              const mineVetoed = mine.includes(r.id);
              return (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <Link
                    href={`/restaurant/${r.slug}`}
                    className={cx("relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800", by.length > 0 && "opacity-40")}
                  >
                    <Photo r={r} sizes="48px" />
                  </Link>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cx(
                        "block truncate font-semibold",
                        by.length ? "text-ink-400 line-through dark:text-ink-500" : "text-ink-900 dark:text-white"
                      )}
                    >
                      {r.name}
                    </span>
                    <span className="block truncate text-[13px] text-ink-500 dark:text-ink-400">
                      {by.length
                        ? `Vetoed by ${by.join(", ")}`
                        : `${priceString(r.priceLevel)} · ${r.cuisine.join(", ")}`}
                    </span>
                  </span>
                  <button
                    onClick={() => toggleVeto(r.id)}
                    aria-pressed={mineVetoed}
                    className={cx(
                      "inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition active:scale-[0.98]",
                      mineVetoed
                        ? "border-root-500 bg-root-500 text-white"
                        : "border-[var(--line)] text-ink-700 hover:border-[var(--line-strong)] dark:text-ink-200"
                    )}
                  >
                    <X size={14} /> {mineVetoed ? "Vetoed" : "Veto"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function sameSet(a: string[], b: string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Help pick where we eat", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed: nothing to do.
    }
  };
  return (
    <Button variant="outline" onClick={share}>
      {copied ? <Check size={16} /> : <Link2 size={16} />}
      {copied ? "Link copied" : "Share link"}
    </Button>
  );
}

function People({
  people,
  me,
  onRename,
}: {
  people: [string, string][];
  me: Me;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(me.name);

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
      <Users size={16} className="text-ink-400" />
      {people.map(([pid, name]) =>
        pid === me.id && editing ? (
          <form
            key={pid}
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) onRename(draft.trim().slice(0, 30));
              setEditing(false);
            }}
            className="flex items-center gap-1.5"
          >
            <input
              autoFocus
              aria-label="Your name"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="well h-9 w-36 rounded-full px-3"
            />
            <button type="submit" className="font-semibold text-root-600 dark:text-root-400">
              Save
            </button>
          </form>
        ) : (
          <span
            key={pid}
            className={cx(
              "inline-flex items-center gap-1 rounded-full px-3 py-1",
              pid === me.id ? "bg-root-50 text-root-700 dark:bg-root-500/10 dark:text-root-300" : "well text-ink-700 dark:text-ink-200"
            )}
          >
            {name}
            {pid === me.id && (
              <>
                <span className="text-root-500/70">(you)</span>
                <button onClick={() => setEditing(true)} aria-label="Change your name" className="ml-0.5">
                  <Pencil size={12} />
                </button>
              </>
            )}
          </span>
        )
      )}
    </div>
  );
}
