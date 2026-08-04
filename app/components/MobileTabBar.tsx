"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Compass, Search, Heart, User } from "lucide-react";
import { useSearch } from "@/app/providers/SearchProvider";
import { cx } from "@/app/lib/utils";

/**
 * Bottom tab bar for phones. Five items is the practical ceiling before the
 * targets get too narrow to hit reliably.
 */
const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/search", label: "Search", icon: Search, action: "search" as const },
  { href: "/favorites", label: "Saved", icon: Heart },
  { href: "/profile", label: "You", icon: User },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const { open } = useSearch();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-[var(--bg)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg dark:border-ink-800 md:hidden"
    >
      <ul className="flex items-stretch">
        {TABS.map((t) => {
          const activeTab =
            t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          const Icon = t.icon;

          const inner = (
            <>
              {activeTab && (
                <motion.span
                  layoutId="tabbar-pill"
                  className="absolute inset-x-3 top-1 h-8 rounded-full bg-root-500/10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                size={21}
                className={cx(
                  "relative transition",
                  activeTab ? "text-root-500" : "text-ink-400"
                )}
                strokeWidth={activeTab ? 2.4 : 1.8}
              />
              <span
                className={cx(
                  "relative text-[11px] font-medium transition",
                  activeTab ? "text-root-600" : "text-ink-400"
                )}
              >
                {t.label}
              </span>
            </>
          );

          const classes =
            "relative flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 pt-1 active:scale-95 transition-transform";

          return (
            <li key={t.href} className="flex-1">
              {/* Search opens the command palette rather than navigating. */}
              {t.action === "search" ? (
                <button
                  onClick={open}
                  className={classes}
                  aria-label="Search"
                  aria-current={activeTab ? "page" : undefined}
                >
                  {inner}
                </button>
              ) : (
                <Link
                  href={t.href}
                  className={classes}
                  aria-current={activeTab ? "page" : undefined}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
