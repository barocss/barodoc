---
title: Barodoc Cloud
description: Example SaaS-style landing — logos, metrics, features, testimonials, pricing, FAQ — all from YAML.
pageLayout: landing
landingPage:
  hero:
    badge: New · Declarative landing blocks
    title: Ship docs your users
    titleHighlight: actually open
    subtitle: Barodoc turns Markdown and MDX into a fast documentation site with search, i18n, and a marketing surface — so product, design, and engineering tell one story without wiring a separate landing stack.
    primaryCta:
      label: Start for free
      href: "/docs/introduction"
    secondaryCta:
      label: Talk to sales
      href: "mailto:hello@example.com"
    snippet: "npx create-barodoc my-product-docs"
  logoStrip:
    title: Trusted by teams who care about craft
    items:
      - name: Acme Platform
      - name: Northwind Labs
      - name: Contoso API
      - name: Globex DX
      - name: Umbrella Cloud
      - name: Initech Docs
  stats:
    title: Proof in the numbers
    subtitle: Illustrative metrics — swap for your own story, segment, or analyst quotes.
    items:
      - value: "4.9/5"
        label: Average satisfaction from docs readers (survey)
      - value: "62%"
        label: Fewer repeated support tickets after launch (typical)
      - value: "<250ms"
        label: p95 time to interactive on static edge
      - value: "40+"
        label: Built-in MDX patterns and API reference helpers
  features:
    title: Platform teams run on Barodoc
    subtitle: From first API guide to full product education — one codebase, one design system, one deploy.
    items:
      - icon: "🧭"
        title: Opinionated IA
        description: Sidebar, tabs, sections, and standalone pages so you can mirror how your product is sold — not how a wiki thinks.
      - icon: "🧩"
        title: MDX that scales
        description: Callouts, steps, API tables, and embeds stay consistent across teams; extend with your own React islands when you need them.
      - icon: "🌍"
        title: i18n without a second CMS
        description: Locale-aware navigation and labels so your landing and docs can ship together in every market you enter.
      - icon: "🔎"
        title: Search that feels instant
        description: Static-friendly Pagefind output — great results on CDN hosting without running a search cluster.
      - icon: "🔐"
        title: SSO-ready story
        description: Pair with your IdP at the edge or gate sensitive guides — the content layer stays portable Markdown.
      - icon: "📈"
        title: Instrument what matters
        description: Drop in analytics plugins and measure which flows convert trials — same surface as your changelog and blog.
  testimonials:
    title: What teams say after launch
    subtitle: Quotes are demo copy — replace with real customers when you ship.
    items:
      - quote: "We finally have a docs site that matches our product polish. Marketing owns the hero, eng owns the API reference — same repo."
        author: Sarah Kim
        role: VP Product, Acme Platform
        avatar: "SK"
      - quote: "Search and versioning cut our 'where is this documented?' pings by more than half in the first quarter."
        author: Jordan Lee
        role: Lead DevRel, Northwind Labs
        avatar: "JL"
      - quote: "The YAML landing blocks let us ship pricing and trust signals without asking frontend for a one-off page every sprint."
        author: Morgan Patel
        role: Director of DX, Contoso API
        avatar: "MP"
  pricing:
    title: Plans that grow with your surface area
    subtitle: Simple tiers for the demo — align names and limits with your packaging.
    plans:
      - name: Starter
        price: "$0"
        period: "/forever"
        description: For open projects and early teams validating the stack.
        features:
          - Unlimited public docs pages
          - Community support
          - Static hosting anywhere
          - MDX + core theme components
        ctaLabel: Get started
        ctaHref: "/docs/introduction"
        highlighted: false
      - name: Growth
        price: "$49"
        period: "/mo"
        description: For product companies shipping weekly and iterating on docs-led growth.
        features:
          - Everything in Starter
          - Private sections & SSO hooks
          - Analytics plugins
          - Priority email support
          - Custom domain & SSL checklist
        ctaLabel: Start trial
        ctaHref: "/docs/guides/landing"
        highlighted: true
      - name: Enterprise
        price: "Let’s talk"
        period: ""
        description: For regulated industries and multi-brand documentation programs.
        features:
          - SLA & onboarding workshop
          - Audit-friendly export
          - Custom theme review
          - Success manager
        ctaLabel: Contact sales
        ctaHref: "mailto:hello@example.com"
        highlighted: false
  faq:
    title: Questions teams ask before rollout
    subtitle: Swap these with objections you hear in real sales calls.
    items:
      - q: Can we keep our existing Markdown and Git workflow?
        a: Yes. Barodoc is built around content in Git — review in PRs, roll back like code, and publish static assets to any CDN you already use.
      - q: How does this differ from a generic static site generator?
        a: You get documentation primitives out of the box — nav models, search integration patterns, MDX components tuned for API and guide content — so you spend time on words, not plumbing.
      - q: Do we need a separate marketing site?
        a: No. Use the same theme for SaaS-style landing sections (hero, stats, pricing, FAQ) and deep docs — or split later without rewriting content.
      - q: What about access control for internal guides?
        a: Host behind your VPN or gate at the edge; the static output stays portable so you are not locked into a single vendor runtime.
      - q: Can we customize the design?
        a: Full custom mode gives you Astro-level control; quick mode keeps you in Markdown with optional barodoc.config.json for theme tokens and navigation.
  cta:
    title: Ready to make docs a growth lever?
    subtitle: "Clone the demo, edit landingPage in YAML, and ship — or compose the same blocks in MDX for full control."
    buttonLabel: Read the landing guide
    buttonHref: "/docs/guides/landing"
  footer:
    tagline: Barodoc — documentation as a product surface
    showLogo: true
    links:
      - label: Product docs
        href: "/docs/introduction"
      - label: Landing guide
        href: "/docs/guides/landing"
      - label: Changelog
        href: "/changelog"
      - label: GitHub
        href: "https://github.com/barocss/barodoc"
---

Below the fold you can still add legal copy, data processing notes, or a compact comparison table — this block is **Markdown** under the generated sections.
