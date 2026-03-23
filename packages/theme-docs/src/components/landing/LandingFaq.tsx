import * as React from "react";

export interface LandingFaqItem {
  q: string;
  a: string;
}

export interface LandingFaqProps {
  title?: string;
  subtitle?: string;
  items: LandingFaqItem[];
}

export function LandingFaq({ title = "Frequently asked questions", subtitle, items }: LandingFaqProps) {
  if (!items.length) return null;

  return (
    <div className="relative py-20 sm:py-24 bg-[var(--bd-bg)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--bd-text)] tracking-tight mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-[var(--bd-text-secondary)]">{subtitle}</p>}
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <details
              key={String(i)}
              className="group rounded-xl border border-[var(--bd-border)] bg-[var(--bd-bg-subtle)]/50 hover:bg-[var(--bd-bg-subtle)] transition-colors open:bg-[var(--bd-bg)] open:shadow-md"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-5 py-4 font-semibold text-[var(--bd-text)] text-left [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span className="shrink-0 text-primary-500 opacity-70 group-open:rotate-180 transition-transform text-xs" aria-hidden>
                  ▼
                </span>
              </summary>
              <div className="px-5 pb-4 text-sm sm:text-base text-[var(--bd-text-secondary)] leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
