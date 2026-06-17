import type { Config } from "tailwindcss";

/**
 * Jc App — "Quiet Luxury" design system.
 *
 * No bright primary colors. Slate, cream, deep charcoal and muted earth tones.
 * Whitespace and typography do the work; borders are ultra-thin and muted.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        cream: "#faf8f5",
        charcoal: "#121212",
        // Muted neutral slate scale
        slate: {
          50: "#f6f6f5",
          100: "#e9e8e5",
          200: "#d4d2cd",
          300: "#b3afa6",
          400: "#8d8980",
          500: "#6f6b62",
          600: "#56534c",
          700: "#403e39",
          800: "#2b2a26",
          900: "#1a1916",
        },
        // Muted earth tones — used sparingly as the only accent family
        earth: {
          50: "#f4efe8",
          100: "#e7ddcf",
          200: "#d2c1a8",
          300: "#b89f7c",
          400: "#9c8261",
          500: "#7e684c",
          600: "#63513c",
          700: "#4a3d2e",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.2em",
      },
      maxWidth: {
        prose: "42rem",
      },
      borderColor: {
        hairline: "rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
