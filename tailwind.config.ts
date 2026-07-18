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
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 20px -8px rgba(23,21,18,0.15)",
        card: "0 8px 30px -12px rgba(23,21,18,0.18)",
        glow: "0 10px 40px -10px rgba(248,75,59,0.45)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
