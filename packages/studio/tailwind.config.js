import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [resolve(__dirname, "./src/**/*.{ts,tsx}"), resolve(__dirname, "./index.html")],
  theme: {
    extend: {
      colors: {
        // CUSTOM-FORK: studio.* palette wired to Raccoon theme tokens
        // defined on :root in src/styles/studio.css. Reskinning the fork is
        // a single edit to those vars — no component touches needed.
        studio: {
          bg: "var(--background)",
          surface: "var(--card)",
          border: "var(--border)",
          text: "var(--foreground)",
          muted: "var(--muted-foreground)",
          accent: "var(--raccoon)",
        },
        raccoon: "var(--raccoon)",
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
