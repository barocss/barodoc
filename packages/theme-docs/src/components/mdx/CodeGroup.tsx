import type { ReactNode } from "react";

interface CodeGroupProps {
  children: ReactNode;
  titles?: string[];
}

export function CodeGroup({ children, titles = [] }: CodeGroupProps) {
  return (
    <div
      className="code-group not-prose my-4 rounded-lg border border-[var(--bd-border)] overflow-hidden"
      data-titles={JSON.stringify(titles)}
    >
      <div className="code-group-tabs flex flex-wrap gap-0 border-b border-[var(--bd-border)] bg-[var(--bd-bg-muted)]" />
      <div className="code-group-content bg-[var(--bd-bg-subtle)]">{children}</div>
    </div>
  );
}
