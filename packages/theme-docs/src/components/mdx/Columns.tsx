import * as React from "react";
import { cn } from "../../lib/utils.js";

interface ColumnsProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function Columns({ children, columns = 2, className }: ColumnsProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("not-prose grid gap-4 my-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}

interface ColumnProps {
  children: React.ReactNode;
  className?: string;
}

export function Column({ children, className }: ColumnProps) {
  return <div className={cn("", className)}>{children}</div>;
}
