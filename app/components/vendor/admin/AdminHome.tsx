"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useVendor } from "@/app/lib/useVendor";
import {
  getSiteSettings,
  DEFAULT_SETTINGS,
  type SiteSettings,
} from "@/app/lib/admin";
import { cx } from "@/app/lib/utils";
import { ChiliLoader } from "../../ui/ChiliLoader";
import { AdminConsole } from "../AdminConsole";
import { RestaurantManager } from "./RestaurantManager";
import { UserManager } from "./UserManager";
import { SiteSettingsPanel } from "./SiteSettingsPanel";

const TABS = [
  { key: "restaurants", label: "Restaurants", icon: Store },
  { key: "users", label: "Users", icon: Users },
  { key: "vendors", label: "Vendors", icon: LayoutDashboard },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/**
 * The admin console.
 *
 * One access gate for every panel. As with the rest of the vendor area, this
 * only decides what the UI offers — Firestore rules are what actually stop a
 * non-admin writing, since anything client-side can be bypassed by anyone
 * willing to open a console.
 */
export function AdminHome() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: vendorLoading } = useVendor();
  const [tab, setTab] = useState<TabKey>("restaurants");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  const loadSettings = useCallback(async () => {
    setSettings(await getSiteSettings());
  }, []);

  useEffect(() => {
    if (isAdmin) loadSettings();
  }, [isAdmin, loadSettings]);

  if (authLoading || vendorLoading) {
    return (
      <div className="py-24">
        <ChiliLoader label="Checking your access…" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <span className="clay-sm mx-auto grid h-14 w-14 place-items-center rounded-2xl text-ink-500">
          <ShieldAlert size={24} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-900 dark:text-white">
          Admins only
        </h1>
        <p className="mt-2 text-ink-500">
          {user
            ? "This account isn't on the admin list."
            : "Sign in with the admin account to manage the site."}
        </p>
        {!user && (
          <Link
            href="/login?next=/admin"
            className="clay-root clay-press mt-6 inline-flex min-h-[48px] items-center rounded-full px-6 font-semibold"
          >
            Sign in
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-6 md:py-12">
      <div className="flex items-center gap-3">
        <span className="clay-root grid h-12 w-12 place-items-center rounded-2xl">
          <ShieldCheck size={22} />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white sm:text-3xl">
            Admin
          </h1>
          <p className="truncate text-sm text-ink-500">
            Signed in as {user.email}
          </p>
        </div>
      </div>

      <div className="scrollbar-hide mt-6 flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cx(
              "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition",
              tab === t.key
                ? "clay-root"
                : "clay-sm clay-press text-ink-600 dark:text-ink-300"
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "restaurants" && (
          <RestaurantManager settings={settings} onSettingsChange={loadSettings} />
        )}
        {tab === "users" && <UserManager />}
        {/* The vendor-claims queue already exists and gates itself; reused
            whole rather than duplicated here. */}
        {tab === "vendors" && <AdminConsole />}
        {tab === "settings" && (
          <SiteSettingsPanel settings={settings} onSaved={loadSettings} />
        )}
      </div>
    </div>
  );
}
