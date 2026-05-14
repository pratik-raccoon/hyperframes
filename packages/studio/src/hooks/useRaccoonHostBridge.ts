// CUSTOM-FORK: minimal postMessage bridge between Studio and the Raccoon host iframe.
// Two messages: RACCOON_MOTION_HOST_HELLO (host → Studio) and RACCOON_EXPORT_REQUESTED (Studio → host).

import { useCallback, useEffect, useState } from "react";

const HOST_HELLO = "RACCOON_MOTION_HOST_HELLO";
const EXPORT_REQUESTED = "RACCOON_EXPORT_REQUESTED";

export type RaccoonExportPayload = {
  projectId: string | null;
  activeCompPath: string | null;
};

export type RaccoonHostBridge = {
  isRaccoonHost: boolean;
  requestExport: (payload: RaccoonExportPayload) => void;
};

export function useRaccoonHostBridge(): RaccoonHostBridge {
  const [isRaccoonHost, setIsRaccoonHost] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;

    function onMessage(event: MessageEvent) {
      if (event.source !== window.parent) return;
      if (typeof event.data !== "object" || event.data === null) return;
      if ((event.data as { type?: unknown }).type === HOST_HELLO) {
        setIsRaccoonHost(true);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const requestExport = useCallback((payload: RaccoonExportPayload) => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;
    window.parent.postMessage({ type: EXPORT_REQUESTED, payload }, "*");
  }, []);

  return { isRaccoonHost, requestExport };
}
