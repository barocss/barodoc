import * as React from "react";

export interface LandingStatItem {
  value: string;
  label: string;
}

export interface LandingStatsProps {
  title?: string;
  subtitle?: string;
  items: LandingStatItem[];
}

export function LandingStats({ title, subtitle, items }: LandingStatsProps) {
  if (!items.length) return null;

  return (
    <div className="relative border-y border-[var(--bd-border)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/[0.06] via-transparent to-primary-400/[0.08] dark:from-primary-400/[0.05] dark:to-primary-600/[0.06] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-25 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230070f3' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {(title || subtitle) && (
          <div className="text-center mb-10 sm:mb-12 max-w-2xl mx-auto">
            {title && (
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 mb-2">
                {title}
              </p>
            )}
            {subtitle && (
              <p className="text-base sm:text-lg text-[var(--bd-text-secondary)] leading-relaxed">{subtitle}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((s) => (
            <div
              key={s.label}
              className="group text-center p-5 sm:p-6 rounded-2xl bg-[var(--bd-bg)]/80 backdrop-blur-sm border border-[var(--bd-border)] shadow-sm hover:shadow-xl hover:border-primary-300/50 dark:hover:border-primary-600/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 dark:from-primary-400 dark:via-primary-300 dark:to-primary-500 mb-2 tabular-nums">
                {s.value}
              </div>
              <div className="text-xs sm:text-sm text-[var(--bd-text-secondary)] font-medium leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
