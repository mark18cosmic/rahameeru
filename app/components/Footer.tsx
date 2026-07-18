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
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-xl font-extrabold text-ink-900 dark:text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-root-500 text-white">
              <UtensilsCrossed size={18} />
            </span>
            Rahameeru
          </div>
          <p className="mt-3 max-w-sm text-sm text-ink-500">
            Discover the best places to eat across Malé and Hulhumalé. Read real
            reviews, save your favorites, and let the wheel decide when you
            can&apos;t.
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
      <div className="border-t border-ink-100 py-5 text-center text-sm text-ink-400 dark:border-ink-800">
        © {new Date().getFullYear()} Rahameeru Reviews. All rights reserved.
      </div>
    </footer>
  );
}
