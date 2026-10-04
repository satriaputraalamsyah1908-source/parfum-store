import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: { 50: "#fffdf9", 100: "#fbf7ef", 200: "#f5eddc" },
        beige: { 100: "#efe6d6", 200: "#e3d5bc", 300: "#d3bf9d", 400: "#c2a77d" },
        brown: { 300: "#a8896b", 500: "#7a5c43", 700: "#4f3a2a", 900: "#2e2118" },
        gold: { 300: "#e0c47a", 400: "#d4af37", 500: "#b8942a", 600: "#977822" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -6px rgba(79, 58, 42, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-in": "slideIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
