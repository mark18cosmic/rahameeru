import Link from "next/link";
import {
  Store,
  BarChart3,
  MessageSquareQuote,
  Utensils,
  ArrowRight,
} from "lucide-react";
import { VendorShell } from "@/app/components/vendor/VendorShell";
import { PlanCards } from "@/app/components/vendor/PlanCards";

export const metadata = {
  title: "For restaurants",
  description:
    "Claim your listing on Rahameeru, keep your menu and hours right, and see what people actually do with your page.",
};

const VALUE = [
  {
    icon: Store,
    title: "Own your page",
    body: "Hours, phone number, description, photos. The details people are wrong about right now.",
  },
  {
    icon: Utensils,
    title: "Menu that stays current",
    body: "Prices move. Update them once here instead of explaining at the table.",
  },
  {
    icon: MessageSquareQuote,
    title: "Reviews in one place",
    body: "Everything people wrote about you, as it lands, with the rating trend behind it.",
  },
  {
    icon: BarChart3,
    title: "See the demand",
    body: "How many people opened your page this week, and which days they were looking.",
  },
];

export default function VendorLandingPage() {
  return (
    <VendorShell>
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-6 md:py-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 clay-sm clay-press rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-600 dark:text-ink-300">
            <Store size={14} className="text-root-500" />
            For restaurants
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-ink-900 dark:text-white md:text-5xl">
            People are already looking you up.
            <br />
            <span className="text-root-500">Decide what they find.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-500 md:text-lg">
            Rahameeru lists restaurants across Malé and Hulhumalé whether or not
            they know about it. Claim yours and the hours, menu and photos come
            from you instead of from the internet&apos;s best guess.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/vendor/signup"
              className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-root-500 px-6 font-semibold text-white transition hover:bg-root-600 active:scale-[0.98]"
            >
              Claim your restaurant <ArrowRight size={18} />
            </Link>
            <Link
              href="/vendor/dashboard"
              className="inline-flex min-h-[52px] items-center clay-sm clay-press rounded-full px-6 font-semibold text-ink-700 transition hover:bg-ink-50 active:scale-[0.98] dark:text-ink-100 dark:hover:bg-ink-800"
            >
              I already applied
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {VALUE.map((v) => (
            <div
              key={v.title}
              className="clay rounded-[2rem] p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-root-100 text-root-600 dark:bg-root-500/15 dark:text-root-300">
                <v.icon size={20} />
              </span>
              <h2 className="mt-4 font-display text-lg font-extrabold text-ink-900 dark:text-white">
                {v.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{v.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white md:text-3xl">
            Plans
          </h2>
          <p className="mt-1.5 text-ink-500">
            Start free. Nothing is charged today — billing isn&apos;t connected
            yet, so choosing a paid plan records what you want and we&apos;ll be
            in touch before anything is ever billed.
          </p>
          <div className="mt-6">
            <PlanCards />
          </div>
        </div>

        <div className="mt-16 clay rounded-[2rem] p-6 md:p-8">
          <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
            How claiming works
          </h2>
          <ol className="mt-4 space-y-4">
            {[
              ["Apply", "Tell us the restaurant, who you are, and how to reach you."],
              [
                "We check",
                "Every application is reviewed by hand. A listing carries other people's reviews, so we don't hand one over on trust alone.",
              ],
              [
                "You're in",
                "Once approved, your dashboard opens with your listings, reviews and visit numbers.",
              ],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-900 text-sm font-bold text-white dark:bg-white dark:text-ink-900">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-ink-500">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </VendorShell>
  );
}
