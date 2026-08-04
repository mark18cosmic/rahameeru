import type { MetadataRoute } from "next";

/**
 * Replaces the empty public/site.webmanifest. Next serves this at
 * /manifest.webmanifest and links it from every page automatically, which is
 * what makes the app installable (and the install prompt fire at all).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rahameeru — Maldives food guide",
    short_name: "Rahameeru",
    description:
      "Find somewhere to eat in Malé and Hulhumalé. Menus, reviews, and a wheel to spin when nobody can decide.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf8f5",
    theme_color: "#F84B3B",
    categories: ["food", "travel", "lifestyle"],
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      { name: "Explore", url: "/explore" },
      { name: "Search", url: "/search" },
      { name: "Favourites", url: "/favorites" },
    ],
  };
}
