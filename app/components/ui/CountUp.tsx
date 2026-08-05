"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Counts from zero to `value` once the number is on screen.
 *
 * Numbers that tick up read as live data rather than a static figure, which is
 * the point on the home page — the counts come from whatever is actually in the
 * database. Honours the OS reduced-motion setting by rendering the final value
 * straight away.
 */
export function CountUp({
  value,
  duration = 900,
  format = (n: number) => n.toLocaleString(),
  className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(reduceMotion ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (reduceMotion || value <= 0) {
      setShown(value);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // Ease-out: most of the distance early, so it settles rather than races.
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done.current) {
          done.current = true;
          run();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      {format(shown)}
    </span>
  );
}
