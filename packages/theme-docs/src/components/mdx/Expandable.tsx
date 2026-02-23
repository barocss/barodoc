import * as React from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { cn } from "../../lib/utils.js";

interface ExpandableProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Expandable({
  title,
  children,
  defaultOpen = false,
  className,
}: ExpandableProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        "not-prose border border-[var(--bd-border)] rounded-lg overflow-hidden my-4",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 bg-[var(--bd-bg-subtle)] hover:bg-[var(--bd-bg-muted)] transition-colors text-left"
      >
        <span className="text-sm font-medium text-[var(--bd-text)]">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--bd-text-muted)] transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-[var(--bd-bg)] border-t border-[var(--bd-border)] text-sm text-[var(--bd-text-secondary)]">
          {children}
        </div>
      )}
    </div>
  );
}

interface ExpandableListProps {
  children: React.ReactNode;
  className?: string;
}

export function ExpandableList({ children, className }: ExpandableListProps) {
  return (
    <div className={cn("space-y-2 my-4", className)}>
      {children}
    </div>
  );
}

interface ExpandableItemProps {
  title: string;
  type?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ExpandableItem({
  title,
  type,
  children,
  defaultOpen = false,
}: ExpandableItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="not-prose border-l-2 border-[var(--bd-border)] pl-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-left group"
      >
        {isOpen ? (
          <Minus className="h-3 w-3 text-[var(--bd-text-muted)]" />
        ) : (
          <Plus className="h-3 w-3 text-[var(--bd-text-muted)]" />
        )}
        <code className="font-mono text-sm text-[var(--bd-text)] group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {title}
        </code>
        {type && (
          <span className="font-mono text-xs text-[var(--bd-text-muted)]">
            {type}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="mt-2 ml-5 text-sm text-[var(--bd-text-secondary)]">
          {children}
        </div>
      )}
    </div>
  );
}
