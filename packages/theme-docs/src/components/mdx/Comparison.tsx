import * as React from "react";
import { cn } from "../../lib/utils.js";

interface ComparisonProps {
  children: React.ReactNode;
  /** Left column label (e.g. "Before", "Option A") */
  leftLabel?: string;
  /** Right column label (e.g. "After", "Option B") */
  rightLabel?: string;
  className?: string;
}

export function Comparison({
  children,
  leftLabel = "Before",
  rightLabel = "After",
  className,
}: ComparisonProps) {
  return (
    <div
      className={cn(
        "not-prose my-4 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-[var(--bd-border)] overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col border-b md:border-b-0 md:border-r border-[var(--bd-border)]">
        <div className="px-4 py-2 bg-[var(--bd-bg-muted)] border-b border-[var(--bd-border)] text-sm font-medium text-[var(--bd-text-heading)]">
          {leftLabel}
        </div>
        <div className="p-4 flex-1">{React.Children.toArray(children)[0]}</div>
      </div>
      <div className="flex flex-col">
        <div className="px-4 py-2 bg-[var(--bd-bg-muted)] border-b border-[var(--bd-border)] text-sm font-medium text-[var(--bd-text-heading)]">
          {rightLabel}
        </div>
        <div className="p-4 flex-1">{React.Children.toArray(children)[1]}</div>
      </div>
    </div>
  );
}

interface ComparisonItemProps {
  children: React.ReactNode;
  className?: string;
}

/** Wrapper for a single side content (use two inside Comparison). */
export function ComparisonItem({ children, className }: ComparisonItemProps) {
  return <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>{children}</div>;
}
