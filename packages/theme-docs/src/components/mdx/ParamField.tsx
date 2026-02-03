import * as React from "react";
import { cn } from "../../lib/utils.js";

interface ParamFieldProps {
  name: string;
  type?: string;
  required?: boolean;
  default?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ParamField({
  name,
  type,
  required,
  default: defaultValue,
  children,
  className,
}: ParamFieldProps) {
  return (
    <div
      className={cn(
        "not-prose border-b border-[var(--color-border)] py-4 last:border-b-0",
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
        {required && (
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
            required
          </span>
        )}
        {defaultValue && (
          <span className="text-xs text-[var(--color-text-muted)]">
            default: <code className="font-mono">{defaultValue}</code>
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

interface ParamFieldGroupProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ParamFieldGroup({ children, title, className }: ParamFieldGroupProps) {
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
