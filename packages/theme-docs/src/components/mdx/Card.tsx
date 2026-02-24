import type { ReactNode } from "react";

interface CardProps {
  title: string;
  icon?: string;
  href?: string;
  children?: ReactNode;
}

export function Card({ title, icon, href, children }: CardProps) {
  const Tag = href ? "a" : "div";
  return (
    <Tag
      href={href}
      className={`card-component not-prose group block p-4 rounded-lg border border-[var(--bd-border)] bg-[var(--bd-bg)] no-underline ${
        href
          ? "cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200"
          : ""
      }`}
    >
      <div className="flex flex-col gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bd-bg-subtle)] group-hover:bg-primary-50 dark:group-hover:bg-primary-950/50 transition-colors">
            <span className="text-xl">{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--bd-text)] group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
              {title}
            </h3>
            {href && (
              <svg
                className="w-4 h-4 text-[var(--bd-text-muted)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
          <div className="mt-1 text-sm text-[var(--bd-text-secondary)] group-hover:text-[var(--bd-text)] leading-relaxed transition-colors">
            {children}
          </div>
        </div>
      </div>
    </Tag>
  );
}

interface CardGroupProps {
  cols?: 1 | 2 | 3 | 4;
  children?: ReactNode;
}

const gridCols: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function CardGroup({ cols = 2, children }: CardGroupProps) {
  return <div className={`not-prose grid gap-5 my-6 ${gridCols[cols]}`}>{children}</div>;
}
