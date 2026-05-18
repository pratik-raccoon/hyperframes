// CUSTOM-FORK: ported from motion/apps/web/src/components/ui/composer.tsx
// Visual recipe + slot model are kept verbatim. Swaps:
//   - lucide ArrowUp/X  →  studio SystemIcons ArrowUp/X
//   - @/lib/utils#cn    →  packages/studio/src/utils/cn
//   - @/components/input/custom-text-area  →  ./CustomTextarea (also ported)

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ChangeEventHandler,
  type ClipboardEventHandler,
  type KeyboardEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import { ArrowUp, X } from "../../icons/SystemIcons";
import { CustomTextarea } from "./CustomTextarea";
import { cn } from "../../utils/cn";

type ComposerSize = "sm" | "md";

interface ComposerProps {
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  onPaste?: ClipboardEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  fieldRef?: Ref<HTMLTextAreaElement>;
  ariaLabel?: string;
  maxHeight?: number;
  attachments?: ReactNode;
  toolbarStart?: ReactNode;
  toolbarEnd?: ReactNode;
  size?: ComposerSize;
  className?: string;
  fieldClassName?: string;
}

export function Composer({
  value,
  onChange,
  onKeyDown,
  onPaste,
  placeholder,
  disabled,
  autoFocus,
  fieldRef,
  ariaLabel,
  maxHeight,
  attachments,
  toolbarStart,
  toolbarEnd,
  size = "md",
  className,
  fieldClassName,
}: ComposerProps) {
  const hasToolbar = toolbarStart != null || toolbarEnd != null;
  const padding = size === "sm" ? "p-2" : "p-3";
  const stackGap = size === "sm" ? "gap-2" : "gap-2.5";
  const toolbarGap = size === "sm" ? "gap-1" : "gap-1.5 sm:gap-2";

  return (
    <div
      data-slot="composer"
      data-size={size}
      className={cn(
        "group/composer relative w-full rounded-lg border border-border/50 transition-colors",
        "focus-within:border-border",
        padding,
        className,
      )}
    >
      <div className={cn("flex flex-col", stackGap)}>
        {attachments != null && (
          <div
            data-slot="composer-attachments"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar"
          >
            {attachments}
          </div>
        )}

        <CustomTextarea
          ref={fieldRef}
          data-slot="composer-field"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          maxHeight={maxHeight ?? (size === "sm" ? 120 : 150)}
          className={cn(
            "w-full bg-transparent text-foreground outline-none focus:ring-0 rounded-md resize-none no-scrollbar",
            size === "sm"
              ? "text-xs placeholder:text-xs placeholder:text-muted-foreground/70 px-1.5 py-1"
              : "text-sm placeholder:text-muted-foreground px-1 py-1",
            fieldClassName,
          )}
        />

        {hasToolbar && (
          <div data-slot="composer-toolbar" className="flex items-center justify-between gap-2">
            <div className={cn("flex items-center", toolbarGap)}>{toolbarStart}</div>
            <div className={cn("flex items-center", toolbarGap)}>{toolbarEnd}</div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ComposerSubmitProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
}

export const ComposerSubmit = forwardRef<HTMLButtonElement, ComposerSubmitProps>(
  function ComposerSubmit({ icon, className, children, type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        data-slot="composer-submit"
        className={cn(
          "h-8 w-8 rounded-md flex items-center justify-center transition-colors cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed",
          "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
          className,
        )}
        {...props}
      >
        {children ?? icon ?? <ArrowUp size={16} />}
      </button>
    );
  },
);

export function ComposerDivider({ className }: { className?: string }) {
  return (
    <div
      data-slot="composer-divider"
      aria-hidden="true"
      className={cn("mx-0.5 h-4 w-px bg-foreground/20", className)}
    />
  );
}

// Re-export X for callers that want the same iconography in attachment chips
// without going through SystemIcons.
export { X as ComposerRemoveIcon };
