"use client";

import { Star } from "lucide-react";
import { cx } from "@/app/lib/utils";

export function Stars({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cx("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-ink-300" strokeWidth={1.5} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star size={size} className="text-saffron-500 fill-saffron-500" strokeWidth={1.5} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function StarInput({
  value,
  onChange,
  size = 30,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`Rate ${i}`}
        >
          <Star
            size={size}
            strokeWidth={1.5}
            className={cx(
              i <= value ? "text-saffron-500 fill-saffron-500" : "text-ink-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
