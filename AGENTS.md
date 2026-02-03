# Barodoc AI Reference

This file provides guidance for AI assistants working with Barodoc.

## Architecture

Barodoc supports two modes:

### Quick Mode (Zero Config)
- Users only need MD files and optional `barodoc.config.json`
- CLI creates temporary Astro project on-the-fly
- No `package.json` or `node_modules` needed

### Full Custom Mode
- Users have full Astro project with `astro.config.mjs`
- Direct control over components, layouts, pages
- Uses `@barodoc/core` and `@barodoc/theme-docs` as dependencies

## Packages

```
packages/
├── barodoc/            # Main CLI (serve, build, create)
├── core/               # @barodoc/core - Astro integration
├── theme-docs/         # @barodoc/theme-docs - UI components
├── create-barodoc/     # Scaffolding CLI
├── plugin-sitemap/     # Sitemap generation
├── plugin-search/      # Pagefind search
└── plugin-analytics/   # Analytics integrations
```

## CLI Commands

```bash
# Quick mode - just run from MD folder
barodoc serve docs          # Dev server
barodoc build docs          # Production build
barodoc preview docs        # Preview build

# Create new project
barodoc create my-docs
# or
pnpm create barodoc my-docs
```

## Quick Mode Project Structure

```
my-docs/
├── docs/
│   └── en/
│       ├── introduction.md    # Title from # heading
│       └── guides/
│           └── setup.md
├── public/                    # Static assets (optional)
├── barodoc.config.json        # Configuration (optional)
└── .gitignore
```

## Full Custom Project Structure

```
my-docs/
├── src/
│   ├── content/docs/
│   ├── components/            # Custom components
│   └── pages/                 # Custom pages
├── astro.config.mjs           # Astro config
├── barodoc.config.json
└── package.json
```

## Configuration (barodoc.config.json)

```typescript
interface BarodocConfig {
  name: string;
  logo?: string;
  favicon?: string;
  
  theme?: {
    colors?: { primary?: string };
  };
  
  i18n?: {
    defaultLocale: string;
    locales: string[];
    labels?: Record<string, string>;
  };
  
  navigation: Array<{
    group: string;
    "group:ko"?: string;
    pages: string[];
  }>;
  
  plugins?: Array<string | [string, object]>;
  
  topbar?: { github?: string };
}
```

## Markdown Processing

- Frontmatter YAML is optional
- If no frontmatter, title is extracted from first `# Heading`
- Description is extracted from first paragraph

```md
# Introduction

This becomes the description.

## Content starts here
```

Is equivalent to:

```md
---
title: Introduction
description: This becomes the description.
---

## Content starts here
```

## Plugin System

```typescript
import { definePlugin } from "@barodoc/core";

export default definePlugin<Options>((options) => ({
  name: "my-plugin",
  
  hooks: {
    "config:loaded": (config, ctx) => config,
    "content:transform": (content) => content,
    "build:start": (ctx) => {},
    "build:done": (buildCtx, ctx) => {},
  },
  
  astroIntegration: (ctx) => ({
    name: "my-plugin",
    hooks: { /* Astro hooks */ },
  }),
}));
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start docs dev server |
| `pnpm build` | Build docs |
| `pnpm build:packages` | Build all packages |
| `pnpm changeset` | Create changeset |
| `pnpm release` | Publish to npm |
