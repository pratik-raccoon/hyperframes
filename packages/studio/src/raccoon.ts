// CUSTOM-FORK: single raccoon switch driving derived per-feature gates.

import {
  resolveStudioBooleanEnvFlag,
  type StudioFeatureFlagEnv,
} from "./components/editor/manualEditingAvailability";

const env = import.meta.env as StudioFeatureFlagEnv;

export const STUDIO_RACCOON_ENV = "VITE_STUDIO_RACCOON";

export const IS_RACCOON_BUILD = resolveStudioBooleanEnvFlag(env, [STUDIO_RACCOON_ENV], false);

export const RACCOON_HIDES_CAPTURE = IS_RACCOON_BUILD;
export const RACCOON_HIDES_EXPORT = IS_RACCOON_BUILD;
export const RACCOON_HIDES_LEFT_SIDEBAR = IS_RACCOON_BUILD;
export const RACCOON_HIDES_COMPOSITION_THUMBNAILS = IS_RACCOON_BUILD;
export const RACCOON_HIDES_HEADER_LOGO = IS_RACCOON_BUILD;
