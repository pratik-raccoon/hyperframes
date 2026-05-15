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
        // (hue 0, sat 0%). Motion's .dark palette in apps/web/src/app/theme.css
        // is hue-tinted (hue 240, sat 5–6%), so the studio's bg-neutral-950,
        // bg-neutral-900, border-neutral-800 etc. used to render "colder
        // gray" than the surrounding motion chrome.
        //
        // The override is intentionally narrow: only the 4 darkest stops
        // (700–950) are re-pinned. Across the studio, 700+ shades are
        // overwhelmingly surfaces/borders (~270 callsites); 600 and below
        // are overwhelmingly text (~330 callsites that were hand-tuned
        // against Tailwind's default grayscale). Re-pinning only 700–950
        // reskins all surfaces to match motion's .dark without shifting any
        // of the text contrast.
        //
        // Anchors:
        //   950 = motion --background  (hsl(240 6% 10%))
        //   900 = motion --card        (hsl(240 6% 12%))
        //   800 = motion --border      (hsl(240 6% 15%))
        //   700 fills the gap between 800 and the unchanged 600 below it.
        neutral: {
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
