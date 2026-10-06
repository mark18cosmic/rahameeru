"use client";

import { motion, useReducedMotion } from "framer-motion";

/*
 * Scroll reveals. Each section rises in once as it reaches the screen, which
 * paces a long page and marks where one block ends and the next begins. Never
 * used inside a horizontal rail: a card animating as it crosses the edge of a
 * swipe is what made the rails feel like they were catching.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * One item of a grid, staggered by its position in the row so a grid fills
 * left to right instead of appearing all at once.
 */
export function StaggerItem({
  index,
  columns = 4,
  children,
  className,
  as = "div",
}: {
  index: number;
  columns?: number;
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % columns) * 0.06, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
