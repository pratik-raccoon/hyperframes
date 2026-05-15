// CUSTOM-FORK: inline replacement for AskAgentModal in raccoon-host mode.
// Reads the active DOM-edit selection + composition context, builds the same
// agent prompt the modal builds, and forwards it through the host postMessage
// bridge (RACCOON_AGENT_PROMPT_SUBMITTED) instead of copying to clipboard.
//
// The upstream AskAgentModal flow is left intact and used in non-raccoon
// builds — see PropertyPanel / App.tsx gates.

import { useCallback, useEffect, useRef, useState } from "react";
import { Composer, ComposerSubmit } from "./Composer";
import { useDomEditContext } from "../../contexts/DomEditContext";
import { useStudioContext } from "../../contexts/StudioContext";
import { useFileManagerContext } from "../../contexts/FileManagerContext";
import type { RaccoonHostBridge } from "../../hooks/useRaccoonHostBridge";
import { buildElementAgentPrompt } from "../editor/domEditing";
import { readTagSnippetByTarget } from "../../utils/sourcePatcher";
import { toProjectAbsolutePath } from "../../utils/studioHelpers";

interface RaccoonAskAgentComposerProps {
  bridge: RaccoonHostBridge;
}

export function RaccoonAskAgentComposer({ bridge }: RaccoonAskAgentComposerProps) {
  const { domEditSelection, agentPromptSelectionContext } = useDomEditContext();
  const { projectId, activeCompPath, currentTime, showToast } = useStudioContext();
  const { projectDir, projectIdRef } = useFileManagerContext();

  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const tagSnippetRef = useRef<string | undefined>(undefined);
  const selectionTokenRef = useRef<unknown>(null);

  // Preload the source-file tag snippet when the selection changes — mirrors
  // preloadAgentPromptSnippet in useAskAgentModal so the prompt body matches
  // the upstream modal output.
  // eslint-disable-next-line no-restricted-syntax
  useEffect(() => {
    tagSnippetRef.current = undefined;
    selectionTokenRef.current = domEditSelection;
    if (!domEditSelection) return;

    const pid = projectIdRef.current;
    if (!pid) return;

    const targetPath = domEditSelection.sourceFile || activeCompPath || "index.html";
    const myToken = domEditSelection;
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(
          `/api/projects/${pid}/files/${encodeURIComponent(targetPath)}`,
        );
        if (!response.ok) return;
        const data = (await response.json()) as { content?: string };
        const html = data.content;
        if (cancelled) return;
        if (selectionTokenRef.current !== myToken) return;
        if (typeof html === "string") {
          tagSnippetRef.current = readTagSnippetByTarget(html, domEditSelection);
        }
      } catch {
        // outerHTML fallback is used at submit time.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [domEditSelection, projectIdRef, activeCompPath]);

  // Clear ack + composer when the selection changes so the chip below
  // reflects the current target.
  // eslint-disable-next-line no-restricted-syntax
  useEffect(() => {
    setValue("");
    bridge.clearAgentPromptAck();
  }, [domEditSelection, bridge]);

  const handleSubmit = useCallback(() => {
    if (!domEditSelection) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const targetPath = domEditSelection.sourceFile || activeCompPath || "index.html";
      const tagSnippet = tagSnippetRef.current ?? domEditSelection.element.outerHTML;
      const prompt = buildElementAgentPrompt({
        selection: domEditSelection,
        currentTime,
        tagSnippet,
        selectionContext: agentPromptSelectionContext,
        userInstruction: trimmed,
        sourceFilePath: toProjectAbsolutePath(projectDir, targetPath),
      });

      bridge.submitAgentPrompt({
        prompt,
        projectId,
        activeCompPath,
        selectionLabel: domEditSelection.label,
        tagSnippet,
        selectionContext: agentPromptSelectionContext ?? null,
      });

      setValue("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to send prompt to host", "error");
    } finally {
      setSubmitting(false);
    }
  }, [
    activeCompPath,
    agentPromptSelectionContext,
    bridge,
    currentTime,
    domEditSelection,
    projectDir,
    projectId,
    showToast,
    value,
  ]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const disabled = !domEditSelection || !value.trim() || submitting;
  const ack = bridge.lastAgentPromptAck;

  return (
    <div className="space-y-1.5">
      <Composer
        size="sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          domEditSelection ? "Ask agent to edit this element…" : "Select an element to ask agent"
        }
        disabled={!domEditSelection || submitting}
        ariaLabel="Ask agent prompt"
        toolbarEnd={
          <ComposerSubmit
            type="button"
            onClick={handleSubmit}
            disabled={disabled}
            aria-label="Send to agent"
          />
        }
      />
      {ack && (
        <div
          className={`text-[10px] leading-tight px-1 ${
            ack.status === "accepted" ? "text-studio-accent" : "text-red-400"
          }`}
        >
          {ack.status === "accepted"
            ? "Sent to host"
            : `Host rejected${ack.reason ? `: ${ack.reason}` : ""}`}
        </div>
      )}
    </div>
  );
}
