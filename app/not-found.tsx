import { UtensilsCrossed } from "lucide-react";
import { ButtonLink } from "@/app/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-24">
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-root-100 text-root-600 dark:bg-root-900/30">
          <UtensilsCrossed size={30} />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-root-600">
          404
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-ink-900 dark:text-white">
          This table&apos;s not set
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ink-500">
          We couldn&apos;t find the page you were looking for. Let&apos;s get you
          back to the good stuff.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Back home</ButtonLink>
          <ButtonLink href="/explore" variant="outline">
            Explore restaurants
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
