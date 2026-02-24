import type { ReactNode } from "react";

interface ApiParamsProps {
  title?: string;
  children?: ReactNode;
}

export function ApiParams({ title = "Parameters", children }: ApiParamsProps) {
  return (
    <div className="my-4 px-2">
      <h4 className="text-sm font-semibold text-[var(--bd-text)] mb-2">{title}</h4>
      <div className="border border-[var(--bd-border)] rounded-lg overflow-hidden">
        <div className="divide-y divide-[var(--bd-border)] px-4">{children}</div>
      </div>
    </div>
  );
}
