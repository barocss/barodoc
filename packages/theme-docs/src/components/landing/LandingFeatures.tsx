import * as React from "react";

export interface LandingFeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface LandingFeaturesProps {
  title: string;
  subtitle?: string;
  items: LandingFeatureItem[];
}

export function LandingFeatures({ title, subtitle, items }: LandingFeaturesProps) {
  return (
    <div className="relative py-20 sm:py-24 bg-[var(--bd-bg-subtle)] border-y border-[var(--bd-border)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/[0.03] to-transparent dark:via-primary-400/[0.04] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-px bg-gradient-to-r from-transparent via-primary-400/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--bd-text)] mb-4 tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-lg text-[var(--bd-text-secondary)] max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {items.map((feature, i) => (
            <div
              key={feature.title + String(i)}
              className="group relative p-6 sm:p-7 rounded-2xl bg-[var(--bd-bg)] border border-[var(--bd-border)] shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-400/5 hover:border-primary-300/60 dark:hover:border-primary-600/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary-500/[0.04] via-transparent to-cyan-500/[0.06] pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-cyan-50 dark:from-primary-950/80 dark:to-cyan-950/40 border border-primary-200/50 dark:border-primary-800/50 mb-5 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <span className="text-2xl sm:text-[1.75rem]" aria-hidden>
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--bd-text)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--bd-text-secondary)] leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
