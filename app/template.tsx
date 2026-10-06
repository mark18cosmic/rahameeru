"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Wraps every page, and re-mounts on navigation: a short fade, so moving
 * between pages reads as a step rather than a hard cut. Opacity only: a
 * transform here would turn every fixed and sticky element on the page
 * (the action bar, the menu's section bar) into a scrolling one mid-fade.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
