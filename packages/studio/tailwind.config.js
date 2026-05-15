import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [resolve(__dirname, "./src/**/*.{ts,tsx}"), resolve(__dirname, "./index.html")],
  theme: {
    extend: {
      colors: {
        // CUSTOM-FORK: Tailwind's default `neutral` ramp is pure grayscale
        // match dark theme of raccoon as hyperframes studio defines the tokens for dark theme but really uses tailwind native neutral colors.
        neutral: {
          50: "hsl(240 5% 96% / <alpha-value>)",
          100: "hsl(240 5% 92% / <alpha-value>)",
          200: "hsl(240 5% 88% / <alpha-value>)",
          300: "hsl(240 5% 80% / <alpha-value>)",
          400: "hsl(240 5% 72% / <alpha-value>)",
          500: "hsl(240 5% 65% / <alpha-value>)",
          600: "hsl(240 5% 40% / <alpha-value>)",
          700: "hsl(240 5% 25% / <alpha-value>)",
          800: "hsl(240 6% 15% / <alpha-value>)",
          900: "hsl(240 6% 12% / <alpha-value>)",
          950: "hsl(240 6% 10% / <alpha-value>)",
        },
        // CUSTOM-FORK: studio.* palette wired to Raccoon theme tokens
        // defined on :root in src/styles/studio.css. Reskinning the fork is
        // a single edit to those vars — no component touches needed.
        //
        // The HSL tokens are stored as bare components, so we wrap them with
        // `hsl(var(--x) / <alpha-value>)` to make opacity modifiers
        // (`bg-secondary/90`, `border-border/50`) emit correct CSS in
        // Tailwind v3 — same shape shadcn/ui uses.
        studio: {
          bg: "hsl(var(--background) / <alpha-value>)",
          surface: "hsl(var(--card) / <alpha-value>)",
          border: "hsl(var(--border) / <alpha-value>)",
          text: "hsl(var(--foreground) / <alpha-value>)",
          muted: "hsl(var(--muted-foreground) / <alpha-value>)",
          accent: "var(--raccoon)",
        },
        raccoon: "var(--raccoon)",
        // CUSTOM-FORK: extra theme tokens used by the ported Composer +
        // raccoon-mode surfaces. Defined in studio.css.
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
      },
      fontFamily: {
        // CUSTOM-FORK: Geist family loaded in index.html.
        sans: ['"Geist"', "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"],
        mono: ['"Geist Mono"', '"JetBrains Mono"', '"SF Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
