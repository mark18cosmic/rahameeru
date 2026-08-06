"use client";

import { motion } from "framer-motion";
import { Check, Minus, Loader2 } from "lucide-react";
import { PLANS, type PlanId } from "@/app/lib/vendor";
import { cx } from "@/app/lib/utils";

export function PlanCards({
  current,
  onChoose,
  pending,
}: {
  current?: PlanId;
  onChoose?: (id: PlanId) => void;
  pending?: PlanId | null;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PLANS.map((plan, i) => {
        const active = current === plan.id;
        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className={cx(
              "relative flex flex-col rounded-3xl border bg-white p-6 dark:bg-ink-900",
              active
                ? "border-root-500 ring-2 ring-root-200 dark:ring-root-900/40"
                : plan.highlight
                  ? "border-ink-900 dark:border-white"
                  : "border-ink-100 dark:border-ink-800"
            )}
          >
            {plan.highlight && !active && (
              <span className="absolute -top-3 left-6 rounded-full bg-ink-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white dark:bg-white dark:text-ink-900">
                Most chosen
              </span>
            )}
            {active && (
              <span className="absolute -top-3 left-6 rounded-full bg-root-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                Your plan
              </span>
            )}

            <h3 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-ink-500">{plan.tagline}</p>

            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold text-ink-900 dark:text-white">
                {plan.price === 0 ? "Free" : plan.price.toLocaleString()}
              </span>
              <span className="text-sm text-ink-400">{plan.cadence}</span>
            </p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
              {/* The ceiling, stated plainly rather than discovered later. */}
              {plan.limits?.map((l) => (
                <li key={l} className="flex items-start gap-2 text-sm text-ink-400">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800">
                    <Minus size={11} strokeWidth={3} />
                  </span>
                  {l}
                </li>
              ))}
            </ul>

            {onChoose && (
              <button
                onClick={() => onChoose(plan.id)}
                disabled={active || pending === plan.id}
                className={cx(
                  "mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-60",
                  active
                    ? "border border-ink-200 text-ink-500 dark:border-ink-700"
                    : "bg-root-500 text-white hover:bg-root-600"
                )}
              >
                {pending === plan.id && <Loader2 size={16} className="animate-spin" />}
                {active ? "Current plan" : `Choose ${plan.name}`}
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
