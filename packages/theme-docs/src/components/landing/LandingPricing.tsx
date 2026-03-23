import * as React from "react";

export interface LandingPricingPlan {
  name: string;
  price: string;
  /** e.g. "/month" or "forever" */
  period?: string;
  description?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
}

export interface LandingPricingProps {
  title: string;
  subtitle?: string;
  plans: LandingPricingPlan[];
}

export function LandingPricing({ title, subtitle, plans }: LandingPricingProps) {
  if (!plans.length) return null;

  return (
    <div className="relative py-20 sm:py-24 bg-[var(--bd-bg-subtle)] border-y border-[var(--bd-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--bd-text)] tracking-tight mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-[var(--bd-text-secondary)] leading-relaxed">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => {
            const hi = plan.highlighted;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
                  hi
                    ? "border-primary-500/60 bg-[var(--bd-bg)] shadow-2xl shadow-primary-500/15 ring-2 ring-primary-500/20 scale-[1.02] z-10"
                    : "border-[var(--bd-border)] bg-[var(--bd-bg)]/90 hover:border-primary-300/50 dark:hover:border-primary-600/40 hover:shadow-lg"
                }`}
              >
                {hi && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-600 to-cyan-600 text-white shadow">
                    Most popular
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[var(--bd-text)]">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-[var(--bd-text-secondary)] mt-2">{plan.description}</p>
                  )}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--bd-text)] to-primary-600 dark:to-primary-400">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-[var(--bd-text-secondary)]">{plan.period}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-[var(--bd-text-secondary)]">
                      <span className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden>
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.ctaHref}
                  className={`inline-flex justify-center items-center w-full py-3 px-4 rounded-xl font-semibold text-center transition-all ${
                    hi
                      ? "text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/30"
                      : "border border-[var(--bd-border)] text-[var(--bd-text)] hover:bg-[var(--bd-bg-subtle)] hover:border-primary-300/60"
                  }`}
                >
                  {plan.ctaLabel}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
