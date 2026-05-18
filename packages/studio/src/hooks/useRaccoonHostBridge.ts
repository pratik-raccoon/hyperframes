// CUSTOM-FORK: minimal postMessage bridge between Studio and the Raccoon host iframe.
//
// Protocol:
//   Studio → host   RACCOON_MOTION_STUDIO_READY      (iframe ready; tells host the listener is live)
//   host  → Studio  RACCOON_MOTION_HOST_HELLO        (handshake; flips isRaccoonHost true)
//   Studio → host   RACCOON_EXPORT_REQUESTED         (header Export button)
//   Studio → host   RACCOON_AGENT_PROMPT_SUBMITTED   (inline Ask Agent composer)
//   host  → Studio  RACCOON_AGENT_PROMPT_ACK         (host acknowledges receipt of the prompt)
//
// The iframe's `load` event in the parent fires before React in this iframe
// finishes mounting + attaching the message listener, so a host that ships
// HOST_HELLO from `load` races us and the message gets dropped. The Studio
// pings STUDIO_READY from `useEffect` (after the listener is registered) so
// the host can reply on demand instead.

import { useCallback, useEffect, useState } from "react";

const STUDIO_READY = "RACCOON_MOTION_STUDIO_READY";
const HOST_HELLO = "RACCOON_MOTION_HOST_HELLO";
const EXPORT_REQUESTED = "RACCOON_EXPORT_REQUESTED";
const AGENT_PROMPT_SUBMITTED = "RACCOON_AGENT_PROMPT_SUBMITTED";
const AGENT_PROMPT_ACK = "RACCOON_AGENT_PROMPT_ACK";

export type RaccoonExportPayload = {
  projectId: string | null;
  activeCompPath: string | null;
};

export type RaccoonAgentPromptPayload = {
  prompt: string;
  projectId: string | null;
  activeCompPath: string | null;
  selectionLabel: string | null;
  tagSnippet: string | null;
  selectionContext: string | null;
};

export type RaccoonAgentPromptAck = {
  status: "accepted" | "rejected";
  reason?: string;
};

export type RaccoonHostBridge = {
  isRaccoonHost: boolean;
  requestExport: (payload: RaccoonExportPayload) => void;
  submitAgentPrompt: (payload: RaccoonAgentPromptPayload) => void;
  lastAgentPromptAck: RaccoonAgentPromptAck | null;
  clearAgentPromptAck: () => void;
};

export function useRaccoonHostBridge(): RaccoonHostBridge {
  const [isRaccoonHost, setIsRaccoonHost] = useState(false);
  const [lastAgentPromptAck, setLastAgentPromptAck] = useState<RaccoonAgentPromptAck | null>(null);

  // eslint-disable-next-line no-restricted-syntax
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;

    function onMessage(event: MessageEvent) {
      if (event.source !== window.parent) return;
      if (typeof event.data !== "object" || event.data === null) return;
      const data = event.data as { type?: unknown; payload?: unknown };
      if (data.type === HOST_HELLO) {
        setIsRaccoonHost(true);
        return;
      }
      if (
        data.type === AGENT_PROMPT_ACK &&
        typeof data.payload === "object" &&
        data.payload !== null
      ) {
        const payload = data.payload as { status?: unknown; reason?: unknown };
        if (payload.status === "accepted" || payload.status === "rejected") {
          setLastAgentPromptAck({
            status: payload.status,
            reason: typeof payload.reason === "string" ? payload.reason : undefined,
          });
        }
      }
    }

    window.addEventListener("message", onMessage);
    // Listener is live — tell the host we're ready so it can reply with
    // HOST_HELLO. Without this ping, hosts that send HOST_HELLO on iframe
    // `load` race the listener and the handshake never lands.
    try {
      window.parent.postMessage({ type: STUDIO_READY }, "*");
    } catch {
      // Cross-origin parents may throw on serialization edge cases — ignore.
    }
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const requestExport = useCallback((payload: RaccoonExportPayload) => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;
    window.parent.postMessage({ type: EXPORT_REQUESTED, payload }, "*");
  }, []);

  const submitAgentPrompt = useCallback((payload: RaccoonAgentPromptPayload) => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;
    setLastAgentPromptAck(null);
    window.parent.postMessage({ type: AGENT_PROMPT_SUBMITTED, payload }, "*");
  }, []);

  const clearAgentPromptAck = useCallback(() => setLastAgentPromptAck(null), []);

  return {
    isRaccoonHost,
    requestExport,
    submitAgentPrompt,
    lastAgentPromptAck,
    clearAgentPromptAck,
  };
}
