"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Heart,
  User as UserIcon,
  Sun,
  Moon,
  LogOut,
  Compass,
  Search as SearchIcon,
  Info,
  ShoppingBag,
} from "lucide-react";
import logo from "@/public/rahameeruLogo.png";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSearch } from "@/app/providers/SearchProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { cx } from "@/app/lib/utils";
import { useCart } from "@/app/lib/useCart";
import { BillSheet } from "./cart/BillSheet";
import { ButtonLink } from "./ui/Button";

const NAV = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { open } = useSearch();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setBillOpen(false), [pathname]);

  return (
    <header
      className={cx(
        "sticky top-0 z-50 transition-colors",
        // Solid rather than translucent on phones: a blurred bar over a moving
        // photo rail reads as smeared, and Android skips the blur anyway.
        scrolled
          ? "nav-solid border-b border-ink-100 dark:border-ink-800"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 md:h-[68px] md:gap-3 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src={logo}
            alt="Rahameeru"
            width={140}
            priority
            className="h-auto w-[104px] dark:brightness-0 dark:invert md:w-[140px]"
          />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cx(
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                pathname === n.href
                  ? "text-root-600"
                  : "text-ink-600 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
              )}
            >
              {n.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={open}
            aria-label="Search"
            className="hidden min-w-[200px] items-center gap-2 rounded-full border border-ink-200 py-2 pl-3 pr-2 text-sm text-ink-500 transition hover:border-ink-300 dark:border-ink-700 md:flex"
          >
            <Search size={16} />
            <span className="hidden md:inline">Search…</span>
            <kbd className="ml-auto hidden rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500 dark:bg-ink-800 md:inline">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setBillOpen(true)}
            aria-label={count > 0 ? `Your bill, ${count} items` : "Your bill"}
            className="relative grid h-9 w-9 place-items-center rounded-full text-ink-600 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            <ShoppingBag size={19} strokeWidth={1.9} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-root-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[var(--bg)]">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full text-ink-600 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-root-500 text-sm font-bold text-white"
              >
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="" width={36} height={36} className="h-full w-full object-cover" />
                ) : (
                  (user.displayName?.[0] ?? user.email?.[0] ?? "U").toUpperCase()
                )}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-ink-100 bg-white py-1 shadow-card dark:border-ink-800 dark:bg-ink-900"
                  >
                    <div className="border-b border-ink-100 px-4 py-3 dark:border-ink-800">
                      <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">
                        {user.displayName ?? "Foodie"}
                      </p>
                      <p className="truncate text-xs text-ink-500">{user.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800">
                      <UserIcon size={16} /> Profile
                    </Link>
                    <Link href="/favorites" className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800">
                      <Heart size={16} /> Favorites
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-root-600 hover:bg-root-50 dark:hover:bg-ink-800"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <ButtonLink href="/login" size="sm" className="hidden md:inline-flex">
              Sign in
            </ButtonLink>
          )}

        </div>
      </nav>

      <BillSheet open={billOpen} onClose={() => setBillOpen(false)} />
    </header>
  );
}
