"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Star, Utensils, MapPin } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSearch } from "@/app/providers/SearchProvider";

const IMAGES = [
  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1105325/pexels-photo-1105325.jpeg?auto=compress&cs=tinysrgb&w=600",
];

export function Hero() {
  const { user } = useAuth();
  const { open } = useSearch();

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:px-6 md:py-20 lg:grid-cols-2">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-root-200 bg-root-50 px-3.5 py-1.5 text-sm font-medium text-root-700 dark:border-root-900/40 dark:bg-root-900/20 dark:text-root-300"
          >
            <Star size={14} className="fill-saffron-500 text-saffron-500" />
            The Maldives&apos; food review guide
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 dark:text-white md:text-6xl"
          >
            {user ? (
              <>
                Welcome back,{" "}
                <span className="text-root-500">
                  {user.displayName?.split(" ")[0] ?? "friend"}
                </span>
                .<br />
                Where to today?
              </>
            ) : (
              <>
                Find your next
                <br />
                <span className="text-root-500">favourite meal.</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-lg text-lg text-ink-500"
          >
            Explore top-rated spots across Malé and Hulhumalé, read honest
            reviews, and let our wheel pick for you when you just can&apos;t
            decide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-7"
          >
            <button
              onClick={open}
              className="flex w-full max-w-lg items-center gap-3 rounded-2xl border border-ink-200 bg-white px-5 py-4 text-left shadow-soft transition hover:shadow-card dark:border-ink-700 dark:bg-ink-900"
            >
              <Search className="text-root-500" />
              <span className="text-ink-400">
                Search “sushi”, “date spot”, “open now”…
              </span>
              <kbd className="ml-auto hidden rounded bg-ink-100 px-2 py-1 text-xs text-ink-500 dark:bg-ink-800 sm:block">
                ⌘K
              </kbd>
            </button>
          </motion.div>

          <div className="mt-8 flex flex-wrap gap-8">
            {[
              { icon: Utensils, stat: "14+", label: "Restaurants" },
              { icon: Star, stat: "2.8k", label: "Reviews" },
              { icon: MapPin, stat: "2", label: "Islands" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <s.icon className="text-root-500" size={22} />
                <div>
                  <p className="text-xl font-extrabold text-ink-900 dark:text-white">
                    {s.stat}
                  </p>
                  <p className="text-xs text-ink-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating image collage */}
        <div className="relative hidden h-[440px] lg:block">
          {[
            { src: IMAGES[0], className: "left-0 top-4 h-52 w-44", delay: 0 },
            { src: IMAGES[1], className: "left-40 top-0 h-64 w-56 z-10", delay: 0.4 },
            { src: IMAGES[2], className: "right-0 top-24 h-44 w-40", delay: 0.8 },
            { src: IMAGES[3], className: "left-8 bottom-0 h-44 w-44", delay: 1.2 },
            { src: IMAGES[4], className: "right-2 bottom-2 h-52 w-48 z-10", delay: 1.6 },
          ].map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`absolute overflow-hidden rounded-3xl shadow-card ring-1 ring-black/5 ${img.className}`}
              style={{ animation: `float 6s ease-in-out ${img.delay}s infinite` }}
            >
              <Image src={img.src} alt="" fill sizes="240px" className="object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
