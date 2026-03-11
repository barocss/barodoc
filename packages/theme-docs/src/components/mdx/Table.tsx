import * as React from "react";
import { cn } from "../../lib/utils.js";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="not-prose my-4 overflow-x-auto rounded-lg border border-[var(--bd-border)]">
      <table className={cn("w-full border-collapse text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn("bg-[var(--bd-bg-muted)] border-b border-[var(--bd-border)]", className)}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={cn("divide-y divide-[var(--bd-border)]", className)}>{children}</tbody>;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function TableRow({ children, className }: TableRowProps) {
  return (
    <tr className={cn("hover:bg-[var(--bd-bg-subtle)] transition-colors", className)}>
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  /** Render as <th> when true */
  header?: boolean;
  align?: "left" | "center" | "right";
}

export function TableCell({
  children,
  className,
  header = false,
  align = "left",
}: TableCellProps) {
  const Comp = header ? "th" : "td";
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";
  return (
    <Comp
      className={cn(
        "px-4 py-3 text-[var(--bd-text)]",
        header && "font-semibold text-[var(--bd-text-heading)]",
        alignClass,
        className
      )}
    >
      {children}
    </Comp>
  );
}
