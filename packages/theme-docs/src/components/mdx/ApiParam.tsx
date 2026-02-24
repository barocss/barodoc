import type { ReactNode } from "react";

interface ApiParamProps {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  children?: ReactNode;
}

export function ApiParam({ name, type, required = false, description, children }: ApiParamProps) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-[var(--bd-border)] last:border-b-0">
      <div className="flex items-center gap-2">
        <code className="text-sm font-semibold text-[var(--bd-text)]">{name}</code>
        <span className="text-xs text-[var(--bd-text-secondary)]">{type}</span>
        {required && (
          <span className="px-1.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded">
            required
          </span>
        )}
      </div>
      {description && <p className="text-sm text-[var(--bd-text-secondary)]">{description}</p>}
      {children}
    </div>
  );
}
