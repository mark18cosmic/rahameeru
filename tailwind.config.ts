import type { Config } from "tailwindcss";
const {nextui} = require("@nextui-org/react");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    colors: {
      'root-100': '#FFE4E1',
      'root-200': '#FFCCC7',
      'root-300': '#FFA8A0',
      'root-400': '#FF7D71',
      'root-500': '#F84B3B',
      'root-600': '#E52E1D',
      'root-700': '#C12314',
      'root-800': '#A02014',
      'white': '#FFFFFF'
    }
  },
  plugins: [nextui()],
};
export default config;
