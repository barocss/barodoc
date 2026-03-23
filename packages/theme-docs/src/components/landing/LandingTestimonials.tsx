import * as React from "react";

export interface LandingTestimonialItem {
  quote: string;
  author: string;
  role: string;
  /** Emoji or short avatar label */
  avatar?: string;
}

export interface LandingTestimonialsProps {
  title: string;
  subtitle?: string;
  items: LandingTestimonialItem[];
}

export function LandingTestimonials({ title, subtitle, items }: LandingTestimonialsProps) {
  if (!items.length) return null;

  return (
    <div className="relative py-20 sm:py-24 bg-[var(--bd-bg)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/[0.03] to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--bd-text)] tracking-tight mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-[var(--bd-text-secondary)] leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((t, i) => (
            <blockquote
              key={t.author + String(i)}
              className="relative flex flex-col p-6 sm:p-8 rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-bg-subtle)]/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-primary-300/40 dark:hover:border-primary-600/30 transition-all duration-300"
            >
              <div className="text-4xl leading-none text-primary-500/40 dark:text-primary-400/30 mb-4 font-serif">"</div>
              <p className="text-[var(--bd-text)] leading-relaxed flex-1 mb-6 text-sm sm:text-base">{t.quote}</p>
              <footer className="flex items-center gap-3 mt-auto pt-4 border-t border-[var(--bd-border)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-cyan-100 dark:from-primary-900/60 dark:to-cyan-900/40 text-xs font-bold tracking-tight text-primary-800 dark:text-primary-200 border border-primary-200/50 dark:border-primary-800/50">
                  {t.avatar ?? "•"}
                </div>
                <div>
                  <cite className="not-italic font-semibold text-[var(--bd-text)] text-sm">{t.author}</cite>
                  <div className="text-xs text-[var(--bd-text-secondary)]">{t.role}</div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </div>
  );
}
