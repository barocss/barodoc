import * as React from "react";

export interface LandingCtaProps {
  title: string;
  subtitle?: string;
  buttonLabel: string;
  buttonHref: string;
}

export function LandingCta({ title, subtitle, buttonLabel, buttonHref }: LandingCtaProps) {
  return (
    <div className="relative py-20 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/[0.08] via-transparent to-violet-600/[0.06] dark:from-primary-500/[0.06] dark:to-violet-500/[0.05] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,56rem)] h-64 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-10 md:p-12 text-center border border-[var(--bd-border)] bg-[var(--bd-bg)]/70 backdrop-blur-xl shadow-2xl shadow-primary-500/10 ring-1 ring-primary-500/10 dark:ring-primary-400/10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--bd-text)] mb-4 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-base sm:text-lg text-[var(--bd-text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          <a
            href={buttonHref}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-600 hover:from-primary-500 hover:via-primary-400 hover:to-cyan-500 shadow-lg shadow-primary-500/35 hover:shadow-xl hover:shadow-primary-500/45 hover:-translate-y-0.5 transition-all duration-200 ring-1 ring-white/15"
          >
            {buttonLabel}
            <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
