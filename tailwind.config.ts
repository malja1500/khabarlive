import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        vazir: ["var(--font-vazir)", "sans-serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#e63946",
          hover: "#ff6b6b",
        },
        gold: "#f4a261",
        surface: {
          DEFAULT: "var(--color-surface)",
          2: "var(--color-surface-2)",
          3: "var(--color-surface-3)",
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease forwards",
        ticker: "ticker 35s linear infinite",
        blink: "blink 1.2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 1.5s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
