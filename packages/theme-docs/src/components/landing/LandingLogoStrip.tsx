import * as React from "react";

export interface LandingLogoStripItem {
  name: string;
  href?: string;
}

export interface LandingLogoStripProps {
  title?: string;
  items: LandingLogoStripItem[];
}

export function LandingLogoStrip({ title = "Trusted by teams who ship", items }: LandingLogoStripProps) {
  if (!items.length) return null;

  return (
    <div className="relative border-b border-[var(--bd-border)] bg-[var(--bd-bg)] py-10 sm:py-12">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[var(--bd-text-muted)] mb-8">
          {title}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14 opacity-90">
          {items.map((item) => {
            const inner = (
              <span className="text-base sm:text-lg font-semibold text-[var(--bd-text-secondary)] hover:text-[var(--bd-text)] transition-colors whitespace-nowrap">
                {item.name}
              </span>
            );
            return item.href ? (
              <a key={item.name} href={item.href} className="grayscale hover:grayscale-0 transition-all">
                {inner}
              </a>
            ) : (
              <span key={item.name} className="grayscale">
                {inner}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
