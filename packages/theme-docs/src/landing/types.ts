/**
 * Frontmatter-driven landing page (VuePress-style declarative home).
 * Used with `pageLayout: landing` on `pages` collection entries.
 */
export interface LandingHeroFm {
  badge?: string;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  snippet?: string;
  snippetAriaLabel?: string;
}

export interface LandingLogoStripFm {
  title?: string;
  items: Array<{ name: string; href?: string }>;
}

export interface LandingStatsFm {
  title?: string;
  subtitle?: string;
  items: Array<{
    value: string;
    label: string;
  }>;
}

export interface LandingFeaturesFm {
  title: string;
  subtitle?: string;
  items: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface LandingTestimonialsFm {
  title: string;
  subtitle?: string;
  items: Array<{
    quote: string;
    author: string;
    role: string;
    avatar?: string;
  }>;
}

export interface LandingPricingFm {
  title: string;
  subtitle?: string;
  plans: Array<{
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    ctaLabel: string;
    ctaHref: string;
    highlighted?: boolean;
  }>;
}

export interface LandingFaqFm {
  title?: string;
  subtitle?: string;
  items: Array<{ q: string; a: string }>;
}

export interface LandingCtaFm {
  title: string;
  subtitle?: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface LandingFooterFm {
  tagline?: string;
  /** When true, uses site `logo` from barodoc config (if set). Default true when footer is present. */
  showLogo?: boolean;
  links?: Array<{ label: string; href: string }>;
}

/** YAML `landingPage:` block (see pages collection schema). */
export interface LandingFrontmatter {
  hero?: LandingHeroFm;
  logoStrip?: LandingLogoStripFm;
  stats?: LandingStatsFm;
  features?: LandingFeaturesFm;
  testimonials?: LandingTestimonialsFm;
  pricing?: LandingPricingFm;
  faq?: LandingFaqFm;
  cta?: LandingCtaFm;
  footer?: LandingFooterFm;
}
