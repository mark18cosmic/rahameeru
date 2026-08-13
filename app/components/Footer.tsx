import Link from "next/link";
import { UtensilsCrossed, Instagram, Twitter, Facebook } from "lucide-react";

const COLS = [
  {
    title: "Discover",
    links: [
      { href: "/explore", label: "Explore" },
      { href: "/search", label: "Search" },
      { href: "/favorites", label: "Favorites" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "#", label: "Privacy Policy" },
      { href: "#", label: "Contact" },
    ],
  },
  {
    // The only door into the vendor side from the diner app.
    title: "Restaurants",
    links: [
      { href: "/vendor", label: "For restaurants" },
      { href: "/vendor/signup", label: "Claim your listing" },
      { href: "/vendor/dashboard", label: "Vendor dashboard" },
    ],
  },
];

export default function Footer() {
  return (
    // Phones have the tab bar for navigation; a six-link footer above it was
    // just more to scroll past.
    <footer className="clay mt-20 hidden rounded-t-[2.5rem] md:block">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-xl font-extrabold text-ink-900 dark:text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-root-500 text-white">
              <UtensilsCrossed size={18} />
            </span>
            Rahameeru
          </div>
          <p className="mt-3 max-w-sm text-sm text-ink-500">
            Menus, opening hours and reviews for places to eat in Malé and
            Hulhumalé. Spin the wheel when nobody can decide.
          </p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-ink-600 transition hover:bg-root-500 hover:text-white dark:bg-ink-800 dark:text-ink-300"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-500 transition hover:text-root-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Extra bottom padding clears the mobile tab bar. */}
      <div className="flex flex-col items-center gap-1 border-t border-ink-100 py-5 pb-[calc(5rem+env(safe-area-inset-bottom))] text-center text-sm text-ink-400 dark:border-ink-800 md:flex-row md:justify-between md:px-6 md:pb-5">
        <p>© {new Date().getFullYear()} Rahameeru Reviews. All rights reserved.</p>
        <p>
          Created by{" "}
          <span className="font-semibold text-ink-600 dark:text-ink-300">
            KM Solutions
          </span>
        </p>
      </div>
    </footer>
  );
}
