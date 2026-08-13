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
              "clay relative flex flex-col rounded-[2rem] p-6",
              // The highlighted tier sits proud of the other two rather than
              // being outlined — with clay, depth is the emphasis.
              active && "ring-2 ring-root-400",
              plan.highlight && "md:-translate-y-3 md:scale-[1.03]"
            )}
          >
            {plan.highlight && !active && (
              <span className="clay-on-color absolute -top-3 left-6 rounded-full bg-ink-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                Most chosen
              </span>
            )}
            {active && (
              <span className="clay-root absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
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
                  <span className="clay-on-color mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
              {/* The ceiling, stated plainly rather than discovered later. */}
              {plan.limits?.map((l) => (
                <li key={l} className="flex items-start gap-2 text-sm text-ink-400">
                  <span className="clay-inset mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-ink-400">
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
                  "mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-60",
                  active ? "clay-inset text-ink-500 dark:text-ink-300" : "clay-root clay-press"
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
