import * as React from "react";
import { cn } from "../../lib/utils.js";

interface FrameProps {
  children: React.ReactNode;
  caption?: string;
  className?: string;
}

export function Frame({ children, caption, className }: FrameProps) {
  return (
    <figure className={cn("not-prose my-6", className)}>
      <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
