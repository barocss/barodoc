import * as React from "react";
import { cn } from "../../lib/utils.js";

type ToastPosition = "inline" | "bottom-right" | "bottom-left" | "top-right" | "top-left";

interface ToastProps {
  children: React.ReactNode;
  /** Visual style */
  variant?: "default" | "success" | "warning" | "error";
  /** When set, toast is rendered in a fixed corner (for action-triggered feedback). Default "inline". */
  position?: ToastPosition;
  className?: string;
}

const variantStyles = {
  default: "bg-[var(--bd-bg-muted)] border-[var(--bd-border)] text-[var(--bd-text)]",
  success: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-200",
  warning: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200",
  error: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200",
};

const positionStyles: Record<Exclude<ToastPosition, "inline">, string> = {
  "bottom-right": "fixed bottom-4 right-4 z-[100]",
  "bottom-left": "fixed bottom-4 left-4 z-[100]",
  "top-right": "fixed top-4 right-4 z-[100]",
  "top-left": "fixed top-4 left-4 z-[100]",
};

export function Toast({ children, variant = "default", position = "inline", className }: ToastProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium shadow-sm",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );

  if (position === "inline") {
    return content;
  }
  return <div className={cn(positionStyles[position])}>{content}</div>;
}

interface ToastIconProps {
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function ToastIcon({ variant = "default", className }: ToastIconProps) {
  if (variant === "success") {
    return (
      <svg
        className={cn("h-4 w-4 shrink-0 text-green-600 dark:text-green-400", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg
        className={cn("h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg
        className={cn("h-4 w-4 shrink-0 text-red-600 dark:text-red-400", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return null;
}

/** Demo: button that shows a toast in bottom-right on click (for docs). */
interface ToastDemoProps {
  variant?: "default" | "success" | "warning" | "error";
  message?: string;
  buttonLabel?: string;
}

export function ToastDemo({
  variant = "success",
  message = "Copied!",
  buttonLabel = "Show toast",
}: ToastDemoProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-[var(--bd-border)] bg-[var(--bd-bg)] text-[var(--bd-text)] hover:bg-[var(--bd-bg-subtle)] transition-colors"
      >
        {buttonLabel}
      </button>
      {visible && (
        <Toast variant={variant} position="bottom-right">
          <ToastIcon variant={variant} />
          {message}
        </Toast>
      )}
    </div>
  );
}
