"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Flame } from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import type { ContentCard } from "@/app/lib/cards";
import { useLiveCards } from "@/app/lib/cards";
import { useRestaurants } from "@/app/lib/useRestaurants";
import { cx } from "@/app/lib/utils";
import { BLUR, Photo } from "../ui/Photo";
import { RailHeader } from "../home/RestaurantRail";

/**
 * One card for both guides and specials. Wide rather than portrait, so a
 * row of them reads as "things to read" next to the rows of places.
 */
export function ContentCardView({
  card,
  restaurant,
  className,
}: {
  card: ContentCard;
  /** The restaurant a special belongs to (or a guide points at), if known. */
  restaurant?: Restaurant;
  className?: string;
}) {
  const special = card.kind === "special";
  const href = special && restaurant ? `/restaurant/${restaurant.slug}` : card.href || "/";

  return (
    <Link
      href={href}
      className={cx(
        "surface press group flex h-full overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-400",
        className
      )}
    >
      <span className="relative w-[38%] shrink-0 bg-ink-100 dark:bg-ink-800">
        {card.image ? (
          <Image
            src={card.image}
            alt=""
            fill
            sizes="160px"
            placeholder="blur"
            blurDataURL={BLUR}
            className="object-cover"
          />
        ) : restaurant ? (
          <Photo r={restaurant} sizes="160px" alt="" />
        ) : (
          <span className="grid h-full place-items-center text-ink-300 dark:text-ink-600">
            <BookOpen size={28} strokeWidth={1.5} />
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col p-4">
        <span className="flex items-center gap-1 truncate text-xs font-semibold text-root-600 dark:text-root-400">
          {special ? (
            <>
              <Flame size={12} className="shrink-0" /> Today at {restaurant?.name ?? "a kitchen nearby"}
            </>
          ) : (
            "Guide"
          )}
        </span>
        <span className="mt-1 line-clamp-2 font-semibold leading-snug text-ink-900 transition-colors group-hover:text-root-600 dark:text-white">
          {card.title}
        </span>
        {card.body && (
          <span className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-500 dark:text-ink-400">
            {card.body}
          </span>
        )}
      </span>
    </Link>
  );
}

/** Finds the restaurant a card is about: its own, or the one its link opens. */
function restaurantFor(card: ContentCard, bySlugOrId: Map<string, Restaurant>) {
  if (card.restaurantId) return bySlugOrId.get(card.restaurantId);
  const slug = card.href?.match(/^\/restaurant\/([^/?#]+)/)?.[1];
  return slug ? bySlugOrId.get(slug) : undefined;
}

/** The home page row: guides first, then today's specials. */
export function WhatsOn() {
  const { cards } = useLiveCards();
  const { restaurants } = useRestaurants();
  if (cards.length === 0) return null;

  const index = new Map<string, Restaurant>();
  for (const r of restaurants) {
    index.set(r.id, r);
    index.set(r.slug, r);
  }

  return (
    <section className="mt-12 md:mt-20">
      <RailHeader
        title="What's on"
        subtitle="Guides from us, and today's specials from the kitchens"
      />
      <div className="scrollbar-hide -mx-5 flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-pl-5 px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-3">
        {cards.slice(0, 9).map((c) => (
          <div key={c.id} className="h-[132px] w-[300px] shrink-0 snap-start md:h-[148px] md:w-auto">
            <ContentCardView card={c} restaurant={restaurantFor(c, index)} />
          </div>
        ))}
        <div aria-hidden className="w-2 shrink-0 md:hidden" />
      </div>
    </section>
  );
}

/** A restaurant's own live special, for the top of its page. */
export function TodaysSpecial({ restaurantId }: { restaurantId: string }) {
  const { cards } = useLiveCards();
  const special = cards.find((c) => c.kind === "special" && c.restaurantId === restaurantId);
  if (!special) return null;
  return (
    <div className="mt-5 rounded-2xl bg-root-50 p-4 dark:bg-root-500/10">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-root-600 dark:text-root-400">
        <Flame size={13} /> Today&apos;s special
      </p>
      <p className="mt-1 font-semibold text-ink-900 dark:text-white">{special.title}</p>
      {special.body && <p className="mt-0.5 text-sm text-ink-600 dark:text-ink-300">{special.body}</p>}
    </div>
  );
}
