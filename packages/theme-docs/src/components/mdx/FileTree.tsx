import * as React from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "../../lib/utils.js";

interface FileTreeProps {
  children: React.ReactNode;
  className?: string;
}

export function FileTree({ children, className }: FileTreeProps) {
  return (
    <div className={cn("not-prose my-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 font-mono text-sm", className)}>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

interface FileProps {
  name: string;
  icon?: React.ReactNode;
}

export function TreeFile({ name, icon }: FileProps) {
  return (
    <li className="flex items-center gap-2 py-0.5 text-[var(--color-text-secondary)]">
      {icon || <File className="h-4 w-4 text-[var(--color-text-muted)]" />}
      <span>{name}</span>
    </li>
  );
}

interface FolderProps {
  name: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}

export function TreeFolder({ name, children, defaultOpen = false }: FolderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const hasChildren = React.Children.count(children) > 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-1 py-0.5 text-[var(--color-text)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        {hasChildren && (
          <ChevronRight
            className={cn(
              "h-3 w-3 text-[var(--color-text-muted)] transition-transform",
              isOpen && "rotate-90"
            )}
          />
        )}
        {!hasChildren && <span className="w-3" />}
        {isOpen ? (
          <FolderOpen className="h-4 w-4 text-primary-500" />
        ) : (
          <Folder className="h-4 w-4 text-primary-500" />
        )}
        <span className="font-medium">{name}</span>
      </button>
      {isOpen && hasChildren && (
        <ul className="ml-4 border-l border-[var(--color-border)] pl-3 mt-1 space-y-1">
          {children}
        </ul>
      )}
    </li>
  );
}
