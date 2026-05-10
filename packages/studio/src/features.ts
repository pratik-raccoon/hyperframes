// CUSTOM-FORK: feature flag surface for the custom studio fork.
// Single source of truth for which Studio capabilities are exposed in the UI.
// Server-side endpoints (POST /render etc.) are NOT gated here — UI only.
export const FEATURES = {
  // Render/Export panel: the "Renders" button in the header and the right-panel
  // RenderQueue mount. Disable to hide all export-to-MP4 entry points from the UI.
  export: false,
} as const;
