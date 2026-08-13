"use client";

import { motion } from "framer-motion";
import { Check, ShieldAlert, Cloud, Smartphone } from "lucide-react";
import { DIET_OPTIONS } from "@/app/lib/diet";
import { usePreferences } from "@/app/lib/usePreferences";
import { cx } from "@/app/lib/utils";

/**
 * Allergen and diet picker.
 *
 * Selections flag matching dishes on every menu in the app. The disclaimer is
 * not decoration — the flags come from reading menu text, not from the kitchen,
 * and anyone with a real allergy needs to know that before they rely on it.
 */
export function DietPicker() {
  const { diet, toggle, clear, synced } = usePreferences();

  const avoid = DIET_OPTIONS.filter((o) => o.kind === "avoid");
  const diets = DIET_OPTIONS.filter((o) => o.kind === "only");

  const Chip = ({
    label,
    on,
    onClick,
  }: {
    label: string;
    on: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cx(
        "inline-flex min-h-[42px] items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition active:scale-95",
        on
          ? "border-root-500 bg-root-500 text-white"
          : "border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300 md:hover:border-ink-400"
      )}
    >
      <motion.span
        initial={false}
        animate={{ width: on ? 16 : 0, opacity: on ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        className="grid place-items-center overflow-hidden"
      >
        <Check size={14} strokeWidth={3} />
      </motion.span>
      {label}
    </button>
  );

  return (
    <section className="clay rounded-[2rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
            Allergies &amp; diet
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            We&apos;ll flag dishes that look like they don&apos;t suit you.
          </p>
        </div>
        {diet.length > 0 && (
          <button
            onClick={clear}
            className="shrink-0 text-sm font-semibold text-root-600 transition hover:text-root-700"
          >
            Clear
          </button>
        )}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">
        Avoid
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {avoid.map((o) => (
          <Chip
            key={o.key}
            label={o.label}
            on={diet.includes(o.key)}
            onClick={() => toggle(o.key)}
          />
        ))}
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-400">
        Eating style
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {diets.map((o) => (
          <Chip
            key={o.key}
            label={o.label}
            on={diet.includes(o.key)}
            onClick={() => toggle(o.key)}
          />
        ))}
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-2xl bg-saffron-400/15 px-3 py-2.5 text-xs leading-relaxed text-ink-600 dark:text-ink-300">
        <ShieldAlert size={15} className="mt-0.5 shrink-0 text-saffron-500" />
        Flags are worked out from the menu wording, not from the restaurant.
        Treat them as a prompt to ask, never as confirmation — always check with
        the kitchen if an allergy is serious.
      </p>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
        {synced ? (
          <>
            <Cloud size={13} /> Saved to your account
          </>
        ) : (
          <>
            <Smartphone size={13} /> Saved on this device · sign in to keep it
          </>
        )}
      </p>
    </section>
  );
}
