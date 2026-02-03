import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/utils.js";

interface TooltipProps {
  children: React.ReactNode;
  tip: string;
}

export function Tooltip({ children, tip }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span className="cursor-help border-b border-dashed border-[var(--color-text-muted)] text-[var(--color-text)]">
            {children}
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={cn(
              "z-50 overflow-hidden rounded-md bg-[var(--color-bg-tertiary)] px-3 py-1.5 text-sm text-[var(--color-text)] shadow-md",
              "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              "max-w-xs"
            )}
            sideOffset={4}
          >
            {tip}
            <TooltipPrimitive.Arrow className="fill-[var(--color-bg-tertiary)]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
