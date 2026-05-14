// CUSTOM-FORK: single sandbox switch driving derived per-feature gates.

import {
  resolveStudioBooleanEnvFlag,
  type StudioFeatureFlagEnv,
} from "./components/editor/manualEditingAvailability";

const env = import.meta.env as StudioFeatureFlagEnv;

export const STUDIO_SANDBOX_ENV = "VITE_STUDIO_SANDBOX";

export const IS_SANDBOX_BUILD = resolveStudioBooleanEnvFlag(env, [STUDIO_SANDBOX_ENV], false);

export const SANDBOX_HIDES_CAPTURE = IS_SANDBOX_BUILD;
export const SANDBOX_HIDES_EXPORT = IS_SANDBOX_BUILD;
export const SANDBOX_HIDES_LEFT_SIDEBAR = IS_SANDBOX_BUILD;
export const SANDBOX_HIDES_COMPOSITION_THUMBNAILS = IS_SANDBOX_BUILD;
export const SANDBOX_HIDES_HEADER_LOGO = IS_SANDBOX_BUILD;
export const SANDBOX_HIDES_PREVIEW_ZOOM = IS_SANDBOX_BUILD;
