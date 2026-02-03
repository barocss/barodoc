import * as React from "react";
import { icons, type LucideIcon as LucideIconType } from "lucide-react";
import { cn } from "../../lib/utils.js";

interface IconProps {
  name: string;
  size?: number | "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: string;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function Icon({ name, size = "md", className, color }: IconProps) {
  // Convert name to PascalCase (e.g., "chevron-right" -> "ChevronRight")
  const iconName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  const LucideIcon = icons[iconName as keyof typeof icons] as LucideIconType | undefined;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  const numericSize = typeof size === "number" ? size : sizeMap[size];

  return (
    <LucideIcon
      size={numericSize}
      className={cn("inline-block", className)}
      style={color ? { color } : undefined}
    />
  );
}

// Pre-built icon components for common use cases
export function CheckIcon({ className }: { className?: string }) {
  return <Icon name="check" className={cn("text-green-500", className)} />;
}

export function XIcon({ className }: { className?: string }) {
  return <Icon name="x" className={cn("text-red-500", className)} />;
}

export function InfoIcon({ className }: { className?: string }) {
  return <Icon name="info" className={cn("text-blue-500", className)} />;
}

export function WarningIcon({ className }: { className?: string }) {
  return <Icon name="alert-triangle" className={cn("text-yellow-500", className)} />;
}
