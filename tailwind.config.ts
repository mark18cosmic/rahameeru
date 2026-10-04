import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand — warm coral
        root: {
          50: "#FFF1EF",
          100: "#FFE4E1",
          200: "#FFCCC7",
          300: "#FFA8A0",
          400: "#FF7D71",
          500: "#F84B3B",
          600: "#E52E1D",
          700: "#C12314",
          800: "#A02014",
          900: "#7F1C13",
        },
        // Neutral ink. Deliberately not warm: the coral carries the warmth,
        // and a cream-and-espresso base was the most generic choice available.
        ink: {
          50: "#F7F7F6",
          100: "#EDEDEB",
          200: "#DADAD7",
          300: "#ABABA7",
          400: "#73736F",
          500: "#62625E",
          600: "#474745",
          700: "#353533",
          800: "#232322",
          900: "#151515",
        },
        saffron: {
          400: "#FFC24B",
          500: "#F5A623",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      // Three radii, used consistently: xl for controls and inner photos,
      // 2xl for cards and panels, 3xl for sheets and the big feature blocks.
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
