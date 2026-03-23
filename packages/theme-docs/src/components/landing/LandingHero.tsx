import * as React from "react";

export interface LandingHeroProps {
  /** Small pill above the headline (e.g. "New", "Powered by …") */
  badge?: string;
  /** Main headline (plain text) */
  title: string;
  /** Gradient-accent segment after `title` (optional) */
  titleHighlight?: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** e.g. install command — shows copy button */
  snippet?: string;
  snippetAriaLabel?: string;
}

export function LandingHero({
  badge,
  title,
  titleHighlight,
  subtitle,
  primaryCta,
  secondaryCta,
  snippet,
  snippetAriaLabel = "Copy command",
}: LandingHeroProps) {
  const [copied, setCopied] = React.useState(false);

  const copySnippet = () => {
    if (!snippet) return;
    void navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Base washes */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/70 via-transparent to-transparent dark:from-primary-950/30 dark:via-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(59,130,246,0.18),transparent)] dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(59,130,246,0.12),transparent)] pointer-events-none" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-primary-400/25 to-cyan-400/10 blur-3xl dark:from-primary-500/15 dark:to-cyan-500/10 pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/15 to-primary-500/10 blur-3xl dark:from-violet-500/10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-cyan-50/80 dark:from-primary-950/60 dark:to-cyan-950/30 border border-primary-200/80 dark:border-primary-800/80 shadow-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
              </span>
              <span className="text-sm font-semibold bg-gradient-to-r from-primary-700 to-cyan-700 dark:from-primary-300 dark:to-cyan-300 bg-clip-text text-transparent">
                {badge}
              </span>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-[var(--bd-text)] mb-6 leading-[1.08]">
            {title}
            {titleHighlight && (
              <>
                {" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-500 dark:from-primary-400 dark:via-primary-300 dark:to-cyan-400">
                  {titleHighlight}
                </span>
              </>
            )}
          </h1>

          <p className="text-lg sm:text-xl text-[var(--bd-text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={primaryCta.href}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-center text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-200 ring-1 ring-white/20"
            >
              {primaryCta.label}
            </a>
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="w-full sm:w-auto px-8 py-3.5 border border-[var(--bd-border)] text-[var(--bd-text)] rounded-xl font-medium hover:bg-[var(--bd-bg-subtle)] hover:border-primary-300/60 dark:hover:border-primary-600/50 backdrop-blur-sm transition-all duration-200 text-center"
              >
                {secondaryCta.label}
              </a>
            )}
          </div>

          {snippet && (
            <div className="mt-12 flex justify-center px-2">
              <div className="inline-flex max-w-full items-center gap-3 px-5 py-3 rounded-xl bg-[var(--bd-bg-subtle)]/90 backdrop-blur-md border border-[var(--bd-border)] shadow-lg ring-1 ring-primary-500/15 dark:ring-primary-400/10">
                <code className="text-sm text-[var(--bd-text-secondary)] font-mono truncate">{snippet}</code>
                <button
                  type="button"
                  className="p-1.5 shrink-0 rounded-lg hover:bg-[var(--bd-bg-muted)] text-[var(--bd-text-muted)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  onClick={copySnippet}
                  aria-label={snippetAriaLabel}
                >
                  {copied ? (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Copied</span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
