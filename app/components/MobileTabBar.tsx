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

  // The vendor and admin areas are a different product with different
  // navigation; the diner tab bar would just be five wrong answers there.
  if (pathname.startsWith("/vendor") || pathname.startsWith("/admin")) return null;

  return (
    // A floating clay slab rather than a bar welded to the bottom edge — the
    // material only reads as moulded when the page shows around it. Solid, not
    // translucent: content scrolling under a blurred bar was the muddiest part
    // of the phone layout.
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 md:hidden"
    >
      <ul className="clay flex items-stretch rounded-[1.75rem] px-1.5 py-1">
        {TABS.map((t) => {
          const activeTab =
            t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          const Icon = t.icon;

          const inner = (
            <>
              {activeTab && (
                <motion.span
                  layoutId="tabbar-pill"
                  className="clay-inset absolute inset-x-1 inset-y-0.5 rounded-[1.25rem]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                size={20}
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
            "relative flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-[1.25rem] transition-transform active:scale-95";

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
