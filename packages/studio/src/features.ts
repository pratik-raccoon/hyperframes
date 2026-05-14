// CUSTOM-FORK: feature flag surface for the custom studio fork.
// Single source of truth for which Studio capabilities are exposed in the UI.
// Server-side endpoints (POST /render etc.) are NOT gated here — UI only.
export const FEATURES = {
  // Render/Export panel: the "Render / Export" button in the header and the
  // right-panel RenderQueue mount. Disable to hide all export-to-MP4 entry
  // points from the UI.
  export: false,
  // Left sidebar (Compositions + Assets file tree). Disable to remove the
  // sidebar, its collapsed-strip toggle, and the resize handle entirely.
  leftSidebar: false,
  // Capture button in the header (downloads a PNG of the current frame).
  capture: false,
  // Composition thumbnails painted as the background of timeline clips. When
  // disabled, the clip falls back to its colored label block. Each thumbnail
  // hits `/api/.../thumbnail/*` on the server, which spins up Puppeteer — the
  // single biggest hidden Chromium-cost path when the timeline has nested
  // compositions or HTML-eligible clips.
  compositionThumbnails: false,
} as const;
