import * as React from "react";

export interface LandingFooterLink {
  label: string;
  href: string;
}

export interface LandingFooterProps {
  /** e.g. "Built with Barodoc" */
  tagline?: string;
  logoSrc?: string;
  logoAlt?: string;
  links?: LandingFooterLink[];
}

export function LandingFooter({ tagline = "Built with Barodoc", logoSrc, logoAlt = "", links = [] }: LandingFooterProps) {
  return (
    <footer className="relative border-t border-[var(--bd-border)] bg-gradient-to-b from-[var(--bd-bg-subtle)] to-[var(--bd-bg)] mt-auto overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/25 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--bd-text-secondary)]">
            {logoSrc && <img src={logoSrc} alt={logoAlt} className="h-5 w-5 opacity-60" />}
            <span className="text-sm">{tagline}</span>
          </div>
          {links.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-6">
              {links.map((link) => (
                <a
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm text-[var(--bd-text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
