import { Compass, Star, Users, Sparkles } from "lucide-react";
import { ButtonLink } from "@/app/components/ui/Button";

export const metadata = {
  title: "About",
  description: "Why we built Rahameeru — the Maldives' food review guide.",
};

const VALUES = [
  {
    icon: Compass,
    title: "Discover",
    body: "Browse hand-curated spots across Malé and Hulhumalé, filtered by vibe, budget and cuisine.",
  },
  {
    icon: Star,
    title: "Review",
    body: "Read honest reviews from real diners and share your own experiences to help others.",
  },
  {
    icon: Sparkles,
    title: "Decide",
    body: "Can't make up your mind? Spin the wheel and let Rahameeru pick your next meal.",
  },
  {
    icon: Users,
    title: "Community",
    body: "We support local restaurants and the food lovers who keep the islands' scene alive.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-root-50 px-3.5 py-1.5 text-sm font-medium text-root-700 dark:bg-root-900/20 dark:text-root-300">
          <Sparkles size={14} /> Our story
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold text-ink-900 dark:text-white md:text-5xl">
          Great food should be easy to find.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-500">
          Rahameeru connects food lovers with the best dining experiences in the
          Maldives — from cozy cafés and hidden gems to special-occasion rooftops.
          We make discovering, reviewing and deciding where to eat effortless.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {VALUES.map((v) => (
          <div
            key={v.title}
            className="rounded-3xl border border-ink-100 bg-white p-6 dark:border-ink-800 dark:bg-ink-900"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-root-100 text-root-600 dark:bg-root-900/30">
              <v.icon size={20} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink-900 dark:text-white">
              {v.title}
            </h3>
            <p className="mt-1.5 text-ink-500">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-3xl bg-root-600 p-10 text-center text-white">
        <h2 className="font-display text-3xl font-extrabold">
          Join the table
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-root-100">
          Create an account to save favourites, write reviews and connect with
          fellow food enthusiasts.
        </p>
        <ButtonLink href="/signup" variant="secondary" size="lg" className="mt-6">
          Get started
        </ButtonLink>
      </div>
    </div>
  );
}
