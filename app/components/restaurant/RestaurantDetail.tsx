"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Share2,
  ChevronLeft,
  Check,
} from "lucide-react";
import type { Restaurant } from "@/app/lib/types";
import {
  priceString,
  isOpenNow,
  todayHoursLabel,
  mapsUrl,
  galleryUrls,
  cx,
} from "@/app/lib/utils";
import { Stars } from "../ui/Stars";
import { Badge } from "../ui/Badge";
import { Button, ButtonLink } from "../ui/Button";
import { FavoriteButton } from "../FavoriteButton";
import { Reviews } from "./Reviews";
import { Menu } from "./Menu";
import { RestaurantCard } from "../RestaurantCard";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Tab = "about" | "menu" | "reviews";

export function RestaurantDetail({
  restaurant,
  similar,
}: {
  restaurant: Restaurant;
  similar: Restaurant[];
}) {
  const gallery = galleryUrls(restaurant, 4);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("about");
  const open = isOpenNow(restaurant.hours);
  const reduceMotion = useReducedMotion();
  const hasMenu = Boolean(restaurant.menu?.length);

  const tabs: { key: Tab; label: string }[] = [
    { key: "about", label: "About" },
    ...(hasMenu ? [{ key: "menu" as const, label: "Menu" }] : []),
    { key: "reviews", label: "Reviews" },
  ];

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: restaurant.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-28 md:px-6 md:pb-6">
      <Link
        href="/explore"
        className="mb-4 inline-flex min-h-[44px] items-center gap-1 text-sm text-ink-500 transition hover:text-root-600"
      >
        <ChevronLeft size={16} /> Back to explore
      </Link>

      {/* Gallery */}
      <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
        <motion.div
          key={active}
          initial={reduceMotion ? false : { opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-ink-100 dark:bg-ink-800"
        >
          <Image
            src={gallery[active]}
            alt={restaurant.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
          />
          <FavoriteButton id={restaurant.id} className="absolute right-4 top-4 h-11 w-11" size={20} />
        </motion.div>
        <div className="grid grid-cols-4 gap-2 md:grid-cols-2 md:gap-3">
          {gallery.map((g, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={active === i}
              className={cx(
                "relative aspect-square overflow-hidden rounded-2xl bg-ink-100 ring-2 transition active:scale-95 dark:bg-ink-800",
                active === i ? "ring-root-500" : "ring-transparent hover:ring-ink-300"
              )}
            >
              <Image src={g} alt="" fill sizes="200px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Title block */}
      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          {open ? (
            <Badge tone="success">
              <Clock size={12} /> Open now
            </Badge>
          ) : (
            <Badge tone="neutral">
              <Clock size={12} /> Closed
            </Badge>
          )}
          <Badge tone="brand">{priceString(restaurant.priceLevel)}</Badge>
          {restaurant.cuisine.map((c) => (
            <Badge key={c} tone="outline">
              {c}
            </Badge>
          ))}
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-900 dark:text-white md:text-4xl">
          {restaurant.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-500">
          <span className="flex items-center gap-1.5">
            <Stars value={restaurant.rating} size={18} />
            <b className="text-ink-800 dark:text-ink-100">
              {restaurant.rating.toFixed(1)}
            </b>
            ({restaurant.reviewCount.toLocaleString()})
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={16} /> {restaurant.location}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="min-w-0">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Restaurant details"
            className="flex gap-1 border-b border-ink-100 dark:border-ink-800"
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={cx(
                  "relative min-h-[48px] px-4 text-sm font-semibold transition",
                  tab === t.key
                    ? "text-root-600"
                    : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"
                )}
              >
                {t.label}
                {tab === t.key && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-root-500"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pt-6"
            >
              {tab === "about" && (
                <>
                  <p className="text-lg leading-relaxed text-ink-600 dark:text-ink-300">
                    {restaurant.description}
                  </p>

                  {restaurant.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {restaurant.tags.map((t) => (
                        <Link
                          key={t}
                          href={`/search?q=${encodeURIComponent(t)}`}
                          className="rounded-full bg-ink-100 px-3.5 py-2 text-sm text-ink-600 transition hover:bg-root-100 hover:text-root-700 active:scale-95 dark:bg-ink-800 dark:text-ink-200"
                        >
                          #{t}
                        </Link>
                      ))}
                    </div>
                  )}

                  {hasMenu && (
                    <button
                      onClick={() => setTab("menu")}
                      className="mt-6 flex w-full items-center justify-between rounded-2xl border border-ink-200 p-4 text-left transition hover:border-root-300 hover:bg-root-50/50 active:scale-[0.99] dark:border-ink-700 dark:hover:bg-ink-800"
                    >
                      <span>
                        <span className="block font-semibold text-ink-900 dark:text-white">
                          See the menu
                        </span>
                        <span className="text-sm text-ink-500">
                          {restaurant.menu!.reduce((n, s) => n + s.items.length, 0)} dishes
                          across {restaurant.menu!.length} sections
                        </span>
                      </span>
                      <ChevronLeft size={20} className="rotate-180 text-ink-400" />
                    </button>
                  )}
                </>
              )}

              {tab === "menu" && hasMenu && <Menu sections={restaurant.menu!} />}

              {tab === "reviews" && (
                <Reviews
                  restaurantId={restaurant.id}
                  seedCount={restaurant.reviewCount}
                  seedRating={restaurant.rating}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft dark:border-ink-800 dark:bg-ink-900">
            <div className="hidden gap-2 md:flex">
              <ButtonLink href={mapsUrl(restaurant)} className="flex-1" target="_blank">
                <Navigation size={16} /> Directions
              </ButtonLink>
              <Button variant="outline" onClick={share} aria-label="Share">
                {copied ? <Check size={16} /> : <Share2 size={16} />}
              </Button>
            </div>

            <div className="space-y-3 text-sm md:mt-5">
              {restaurant.address && (
                <Row icon={<MapPin size={16} />} label={restaurant.address} />
              )}
              <Row
                icon={<Clock size={16} />}
                label={todayHoursLabel(restaurant.hours)}
                accent={open ? "open" : "closed"}
              />
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone}`} className="block">
                  <Row icon={<Phone size={16} />} label={restaurant.phone} link />
                </a>
              )}
              {restaurant.email && (
                <a href={`mailto:${restaurant.email}`} className="block">
                  <Row icon={<Mail size={16} />} label={restaurant.email} link />
                </a>
              )}
            </div>

            {restaurant.hours && (
              <div className="mt-5 border-t border-ink-100 pt-4 dark:border-ink-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Opening hours
                </p>
                <ul className="space-y-1 text-sm">
                  {restaurant.hours.map((h) => (
                    <li
                      key={h.day}
                      className={cx(
                        "flex justify-between",
                        h.day === new Date().getDay()
                          ? "font-semibold text-ink-900 dark:text-white"
                          : "text-ink-500"
                      )}
                    >
                      <span>{DAYS[h.day]}</span>
                      <span>
                        {h.open === "00:00" && h.close === "23:59"
                          ? "24 hours"
                          : `${h.open} – ${h.close}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-2xl font-extrabold text-ink-900 dark:text-white">
            Similar places nearby
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {similar.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile action bar — kept above the tab bar's safe area. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex gap-2 border-t border-ink-100 bg-[var(--bg)]/95 px-4 py-3 backdrop-blur dark:border-ink-800 md:hidden">
        <ButtonLink href={mapsUrl(restaurant)} className="flex-1" target="_blank">
          <Navigation size={16} /> Directions
        </ButtonLink>
        <Button variant="outline" onClick={share} aria-label="Share">
          {copied ? <Check size={18} /> : <Share2 size={18} />}
        </Button>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  link,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  link?: boolean;
  accent?: "open" | "closed";
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-ink-400">{icon}</span>
      <span
        className={
          accent === "open"
            ? "font-medium text-emerald-600"
            : accent === "closed"
              ? "font-medium text-ink-500"
              : link
                ? "text-root-600 hover:underline"
                : "text-ink-700 dark:text-ink-200"
        }
      >
        {label}
      </span>
    </div>
  );
}
