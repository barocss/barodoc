import * as React from "react";
import { cn } from "../../lib/utils.js";

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  return (
    <div className={cn("bd-steps", className)}>
      {children}
    </div>
  );
}

interface StepProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export function Step({ title, children, className }: StepProps) {
  return (
    <div className={cn("bd-step", className)}>
      <div className="bd-step-indicator">
        <span className="bd-step-number" />
        <div className="bd-step-connector" />
      </div>
      <div className="bd-step-content">
        <h3 className="bd-step-title">{title}</h3>
        {children && (
          <div className="bd-step-body prose prose-sm dark:prose-invert max-w-none">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
