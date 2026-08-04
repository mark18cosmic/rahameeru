import { Compass, Star, Users, Sparkles } from "lucide-react";
import { ButtonLink } from "@/app/components/ui/Button";

export const metadata = {
  title: "About",
  description: "What Rahameeru is, and who keeps it up to date.",
};

const VALUES = [
  {
    icon: Compass,
    title: "Every place, not just the big ones",
    body: "Cafés with four tables count as much as the rooftops. If you can eat there and it's in Malé or Hulhumalé, it belongs here.",
  },
  {
    icon: Star,
    title: "Reviews from people who went",
    body: "No sponsored placements and no paid rankings. If a rating looks off, it's because that's what people wrote.",
  },
  {
    icon: Sparkles,
    title: "A wheel, for the arguments",
    body: "Filter by island and budget, spin once, go. It settles dinner faster than the group chat will.",
  },
  {
    icon: Users,
    title: "Kept current",
    body: "Hours and menus drift. Tell us when something's wrong and we'll fix it — that's most of the work.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-root-50 px-3.5 py-1.5 text-sm font-medium text-root-700 dark:bg-root-900/20 dark:text-root-300">
          <Sparkles size={14} /> About
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold text-ink-900 dark:text-white md:text-5xl">
          Nobody should have to ask the group chat.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-500">
          Rahameeru started as a shared note of places worth eating at in Malé.
          It&apos;s now a proper list — with menus, opening hours and what people
          thought — covering Malé and Hulhumalé.
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
          Been somewhere good?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-root-100">
          Make an account to save places you liked and leave a review for the
          next person deciding.
        </p>
        <ButtonLink href="/signup" variant="secondary" size="lg" className="mt-6">
          Create an account
        </ButtonLink>
      </div>
    </div>
  );
}
