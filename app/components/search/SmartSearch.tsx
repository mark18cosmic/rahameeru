"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Search, MapPin, TrendingUp, CornerDownLeft, Clock } from "lucide-react";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { buildFuse, runSearch, emptyFilters } from "@/app/lib/search";
import { priceString, isOpenNow } from "@/app/lib/utils";
import { Stars } from "../ui/Stars";

const QUICK = ["Seafood", "Cafés", "Date Spots", "Fast food", "Open"];

export function SmartSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { restaurants } = useRestaurants();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(() => buildFuse(restaurants), [restaurants]);

  const results = useMemo(() => {
    if (!q.trim()) {
      return [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 6);
    }
    return runSearch(restaurants, fuse, { ...emptyFilters, query: q }).slice(0, 8);
  }, [q, restaurants, fuse]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  const go = (slug: string) => {
    onClose();
    router.push(`/restaurant/${slug}`);
  };

  const submitToSearchPage = () => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(results[active].slug);
      else if (q.trim()) submitToSearchPage();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-card dark:bg-ink-900"
          >
            <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4 dark:border-ink-800">
              <Search size={20} className="text-ink-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search restaurants, cuisines, vibes…"
                className="flex-1 bg-transparent text-lg text-ink-900 outline-none placeholder:text-ink-400 dark:text-white"
              />
              <kbd className="hidden rounded-md bg-ink-100 px-2 py-1 text-xs text-ink-500 dark:bg-ink-800 sm:block">
                ESC
              </kbd>
            </div>

            {!q.trim() && (
              <div className="flex flex-wrap gap-2 px-5 pt-4">
                {QUICK.map((t) => (
                  <button
                    key={t}
                    onClick={() => setQ(t === "Open" ? "" : t)}
                    className="rounded-full bg-ink-100 px-3 py-1.5 text-sm text-ink-700 transition hover:bg-root-100 hover:text-root-700 dark:bg-ink-800 dark:text-ink-200"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="max-h-[52vh] overflow-y-auto p-2">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                {q.trim() ? (
                  <span className="flex items-center gap-1">
                    <Search size={12} /> Results
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} /> Trending now
                  </span>
                )}
              </p>

              {results.length === 0 && (
                <div className="px-4 py-8 text-center text-ink-400">
                  No matches for “{q}”. Try a cuisine or a vibe.
                </div>
              )}

              {results.map((r, i) => (
                <button
                  key={r.id}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r.slug)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    active === i
                      ? "bg-root-50 dark:bg-ink-800"
                      : "hover:bg-ink-50 dark:hover:bg-ink-800/60"
                  }`}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                    <Image src={r.image} alt={r.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-ink-900 dark:text-white">
                        {r.name}
                      </span>
                      {isOpenNow(r.hours) && (
                        <span className="flex items-center gap-0.5 text-xs text-emerald-600">
                          <Clock size={11} /> Open
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-500">
                      <span className="truncate">{r.cuisine.join(" · ")}</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin size={11} /> {r.location}
                      </span>
                      <span>{priceString(r.priceLevel)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-700 dark:text-ink-200">
                    <Stars value={r.rating} size={12} />
                    {r.rating.toFixed(1)}
                  </div>
                </button>
              ))}
            </div>

            {q.trim() && (
              <button
                onClick={submitToSearchPage}
                className="flex w-full items-center justify-between border-t border-ink-100 px-5 py-3 text-sm text-ink-600 transition hover:bg-ink-50 dark:border-ink-800 dark:text-ink-300 dark:hover:bg-ink-800/60"
              >
                <span>
                  See all results for <b>“{q}”</b>
                </span>
                <CornerDownLeft size={16} />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
