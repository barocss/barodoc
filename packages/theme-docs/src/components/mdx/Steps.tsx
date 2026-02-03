import * as React from "react";
import { cn } from "../../lib/utils.js";

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  return (
    <div className={cn("not-prose my-6 ml-4 border-l-2 border-[var(--color-border)] pl-6 space-y-6", className)}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<StepProps>, {
            stepNumber: index + 1,
          });
        }
        return child;
      })}
    </div>
  );
}

interface StepProps {
  title: string;
  children?: React.ReactNode;
  stepNumber?: number;
  className?: string;
}

export function Step({ title, children, stepNumber = 1, className }: StepProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Step number circle */}
      <div className="absolute -left-[2.125rem] flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-border)] bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-muted)]">
        {stepNumber}
      </div>
      {/* Content */}
      <div>
        <h3 className="font-semibold text-[var(--color-text)] mb-2">{title}</h3>
        {children && (
          <div className="text-sm text-[var(--color-text-secondary)] prose prose-sm dark:prose-invert max-w-none">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
