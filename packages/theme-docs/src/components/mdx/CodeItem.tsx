import type { ReactNode } from "react";

interface CodeItemProps {
  title?: string;
  children?: ReactNode;
}

export function CodeItem({ title = "", children }: CodeItemProps) {
  return (
    <div className="code-item" data-title={title}>
      {children}
    </div>
  );
}
