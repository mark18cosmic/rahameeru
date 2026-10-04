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
        // Warm ink / surface neutrals
        ink: {
          50: "#F7F6F4",
          100: "#EDEBE7",
          200: "#DCD8D1",
          300: "#BFB9AE",
          400: "#8E877B",
          500: "#6B6459",
          600: "#4E483F",
          700: "#3A352E",
          800: "#26221D",
          900: "#171512",
        },
        saffron: {
          400: "#FFC24B",
          500: "#F5A623",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "serif"],
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
