"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useVendor } from "@/app/lib/useVendor";
import { cx } from "@/app/lib/utils";

/**
 * Chrome for the vendor side of the app.
 *
 * Kept visually distinct from the consumer app — darker header, no search, no
 * restaurant rails — so nobody has to wonder which side of the product they are
 * looking at. Consumer pages never link into these routes beyond a single
 * "for restaurants" entry in the footer.
 */
export function VendorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { vendor, isAdmin } = useVendor();

  const tabs = [
    { href: "/vendor", label: "Overview", icon: Store, exact: true },
    ...(vendor
      ? [{ href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard }]
      : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-[70vh]">
      <div className="clay rounded-b-[2rem]">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-5 md:px-6 scrollbar-hide">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cx(
                  "relative flex min-h-[52px] shrink-0 items-center gap-2 px-3 text-sm font-semibold transition",
                  active
                    ? "text-root-600"
                    : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"
                )}
              >
                <t.icon size={16} />
                {t.label}
                {active && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-root-500" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
