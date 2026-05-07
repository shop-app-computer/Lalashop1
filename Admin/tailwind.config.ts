import type { Config } from "tailwindcss";

const config: Config = {
  content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00aeff",
          hover: "#0077b6",
          soft: "#e0f7ff",
        },
        secondary: "#00aeff",
        gray: {
          light: "#F8FAFC",
          border: "#E2E8F0",
        },
        accent: "#FFB347",
        dark: "#1A1A2E",
        navy: "#16213E",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
