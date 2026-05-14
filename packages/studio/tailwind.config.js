import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [resolve(__dirname, "./src/**/*.{ts,tsx}"), resolve(__dirname, "./index.html")],
  theme: {
    extend: {
      // CUSTOM-FORK: Geist Sans + Mono (matches Raccoon motion/web). Affects every
      // `font-sans` / `font-mono` Tailwind utility used across Studio components.
      fontFamily: {
        sans: [
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"Geist Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        // CUSTOM-FORK: custom brand palette (matches apps/web theme.css dark mode tokens)
        studio: {
          bg: "#18181b",
          surface: "#1d1d20",
          border: "#262629",
          text: "#cbcbcd",
          muted: "#737373",
          accent: "#5d5fef",
        },
      },
    },
  },
  plugins: [],
};
