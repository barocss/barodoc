import * as React from "react";
import { cn } from "../../lib/utils.js";

interface ResponseFieldProps {
  name: string;
  type?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ResponseField({
  name,
  type,
  children,
  className,
}: ResponseFieldProps) {
  return (
    <div
      className={cn(
        "not-prose border-b border-[var(--color-border)] py-4 first:pt-0 last:border-b-0",
        className
      )}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <code className="font-mono text-sm font-semibold text-[var(--color-text)]">
          {name}
        </code>
        {type && (
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            {type}
          </span>
        )}
      </div>
      {children && (
        <div className="mt-2 text-sm text-[var(--color-text-secondary)] prose prose-sm dark:prose-invert max-w-none">
          {children}
        </div>
      )}
    </div>
  );
}

interface ResponseFieldGroupProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ResponseFieldGroup({ children, title, className }: ResponseFieldGroupProps) {
  return (
    <div className={cn("my-6", className)}>
      {title && (
        <h4 className="text-sm font-semibold text-[var(--color-text)] mb-4 uppercase tracking-wide">
          {title}
        </h4>
      )}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4">
        {children}
      </div>
    </div>
  );
}
