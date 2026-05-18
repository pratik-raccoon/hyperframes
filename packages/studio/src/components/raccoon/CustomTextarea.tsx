// CUSTOM-FORK: ported from
// motion/apps/web/src/components/input/custom-text-area.tsx so the raccoon
// Composer below matches motion's visual + auto-grow behavior exactly.

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
  onHeightChange?: (height: number) => void;
  isFullscreen?: boolean;
}

export const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  function CustomTextarea(
    { maxHeight = 150, onHeightChange, isFullscreen = false, className = "", ...props },
    forwardedRef,
  ) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const frameRef = useRef<number | null>(null);

    useImperativeHandle(forwardedRef, () => internalRef.current!);

    const updateHeight = useCallback(() => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(() => {
        const textarea = internalRef.current;
        if (!textarea) return;

        if (isFullscreen) {
          textarea.style.height = "100%";
          onHeightChange?.(textarea.clientHeight);
          frameRef.current = null;
          return;
        }

        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;
        onHeightChange?.(newHeight);
        frameRef.current = null;
      });
    }, [maxHeight, onHeightChange, isFullscreen]);

    // eslint-disable-next-line no-restricted-syntax
    useEffect(() => {
      updateHeight();
    }, [props.value, updateHeight, isFullscreen]);

    // eslint-disable-next-line no-restricted-syntax
    useEffect(() => {
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }, [updateHeight]);

    // eslint-disable-next-line no-restricted-syntax
    useEffect(() => {
      return () => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }
      };
    }, []);

    const fullscreenClassName = isFullscreen ? "bg-muted/20 p-2" : "";

    return (
      <textarea
        {...props}
        className={`${className} ${fullscreenClassName}`}
        ref={internalRef}
        rows={1}
        style={{
          minHeight: isFullscreen ? "100%" : "2.25rem",
          maxHeight: isFullscreen ? "none" : `${maxHeight}px`,
          overflowY: "auto",
          ...props.style,
        }}
      />
    );
  },
);
