---
name: barodoc-overview
description: Barodoc documentation framework overview. Use when working with Barodoc projects, understanding the architecture, or setting up new documentation sites.
---

# Barodoc Overview

Barodoc is a Mintlify-style documentation framework built on Astro with MDX support.

## Architecture

```
barodoc/
├── packages/
│   ├── barodoc/          # CLI tool (barodoc serve/build/create)
│   ├── core/             # @barodoc/core - Astro integration & config
│   ├── theme-docs/       # @barodoc/theme-docs - Documentation theme
│   ├── create-barodoc/   # Project scaffolding (pnpm create barodoc)
│   ├── plugin-sitemap/   # @barodoc/plugin-sitemap
│   ├── plugin-search/    # @barodoc/plugin-search
│   └── plugin-analytics/ # @barodoc/plugin-analytics
└── docs/                 # Self-documentation site
```

## Two Usage Modes

### Quick Mode (Zero Config)

For simple documentation with just markdown files:

```bash
# Create project
barodoc create my-docs
cd my-docs

# Start dev server
barodoc serve

# Build for production
barodoc build
```

Project structure:
```
my-docs/
├── barodoc.config.json   # Configuration
├── docs/
│   └── en/
│       ├── introduction.md
│       └── quickstart.md
└── public/
    └── logo.svg
```

### Full Custom Mode

For advanced customization with full Astro project:

```bash
# Requires astro.config.mjs
npx astro dev
```

Project structure:
```
my-docs/
├── astro.config.mjs      # Astro configuration (required)
├── barodoc.config.json   # Barodoc configuration
├── src/
│   └── content/
│       └── docs/
│           ├── en/
│           └── ko/
└── public/
```

## Key Files

| File | Purpose |
|------|---------|
| `barodoc.config.json` | Site name, navigation, i18n, theme |
| `astro.config.mjs` | Astro settings, i18n routing (Full Custom only) |
| `src/content/config.ts` | Content collection schema (Full Custom only) |

## Package Exports

### @barodoc/core

```typescript
import barodoc from "@barodoc/core";
import { loadConfig } from "@barodoc/core/config";
import { getLocaleFromPath } from "@barodoc/core/i18n";
import { definePlugin } from "@barodoc/core/plugins";
```

### @barodoc/theme-docs

```typescript
import docsTheme from "@barodoc/theme-docs";
import { ThemeToggle, Search, Tabs, Tab } from "@barodoc/theme-docs";
```

## Development Commands

```bash
# Run CLI without building (tsx)
pnpm barodoc serve docs

# Build all packages
pnpm build:packages

# Run docs site
pnpm dev
```

## Virtual Modules

Barodoc exposes config via virtual modules:

```typescript
// Access in Astro components
import config from "virtual:barodoc/config";
import { i18n, defaultLocale, locales } from "virtual:barodoc/i18n";
```
