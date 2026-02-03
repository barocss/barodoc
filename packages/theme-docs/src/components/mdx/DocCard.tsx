import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { cn } from "../../lib/utils";
import { ChevronRight } from "lucide-react";

interface DocCardProps {
  title: string;
  icon?: string;
  href?: string;
  children?: React.ReactNode;
}

export function DocCard({ title, icon, href, children }: DocCardProps) {
  const Comp = href ? "a" : "div";
  
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        href && "cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg hover:shadow-primary-500/5"
      )}
    >
      <Comp href={href} className="block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-950/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <CardHeader className="relative">
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-bg-secondary)] group-hover:bg-primary-50 dark:group-hover:bg-primary-950/50 mb-3 transition-colors">
              <span className="text-xl">{icon}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <CardTitle className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {title}
            </CardTitle>
            {href && (
              <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            )}
          </div>
          {children && (
            <CardDescription className="mt-1.5 leading-relaxed">
              {children}
            </CardDescription>
          )}
        </CardHeader>
      </Comp>
    </Card>
  );
}

interface DocCardGroupProps {
  cols?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

export function DocCardGroup({ cols = 2, children }: DocCardGroupProps) {
  const gridCols: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("not-prose grid gap-4 my-6", gridCols[cols])}>
      {children}
    </div>
  );
}

export default DocCard;
