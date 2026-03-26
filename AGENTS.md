# Barodoc AI Reference

This file provides guidance for AI assistants working with Barodoc.

## Architecture

Barodoc supports two modes:

### Quick Mode (Zero Config)
- Users only need MD files and optional `barodoc.config.json`
- CLI creates a temporary Astro project under **`<project>/.barodoc/`** and runs Astro from there
- **Isolated install:** quick mode writes a dedicated `package.json` in `.barodoc/` and runs **`npm install`** there (not a symlink to the CLI or monorepo root `node_modules`), so dependency resolution matches a normal project and avoids hoisted dev-tooling conflicts
- **Monorepo dev:** when the CLI runs from the Barodoc repo, `@barodoc/*` packages are installed via **`npm pack`** tarballs (with `workspace:*` rewritten to semver inside the pack) so Astro 5 builds stay inside `.barodoc/` without broken path joins
- **Cache:** `.barodoc-deps-hash` plus workspace package versions decide when to reinstall; `src/`, `public`, and `overrides` are refreshed each run
- **Requirements:** **npm** (on `PATH`) and network on first install or after dependency changes; local npm caches live under `.barodoc/.npm-cache` and `.barodoc/.npm-pack-cache`

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
    pages: Array<string | { label: string; "label:ko"?: string; pages: string[] }>;
  }>;
  
  plugins?: Array<string | [string, object]>;
  
  topbar?: { github?: string };

  /** Doc footer link to changelog (path or URL). */
  changelogUrl?: string;

  feedback?: {
    enabled: boolean;
    endpoint?: string;
    /** "Report an issue" (e.g. GitHub issues/new); page title sent as query when possible. */
    issueUrl?: string;
  };
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

### Wikilinks (Obsidian-style)

In `@barodoc/theme-docs`, `[[...]]` in `.md`/`.mdx` is resolved at **MDX compile time** (remark), so **dev and production** use the same rules. Targets are resolved within the same content section (`docs`, `help`, etc.); see `packages/theme-docs/src/lib/wikiIndex.ts` for resolution order and tests.

### Reader-oriented frontmatter (optional)

- **`since`** — text badge (e.g. product version).
- **`deprecated`** — `true` or a short string (shown next to the badge).
- **`experimental`** — boolean badge.
- **`changelogUrl`** — overrides site `changelogUrl` for the doc footer link.

### Link graph

- **`/graph`** — interactive view of **[[wikilinks]]**, **Markdown** `[text](href)`, and **MDX `<a href>`** (Sigma.js). Optional query **`?focus=`** (doc id or path) highlights that page and its neighbors.
- **`graph.json`** — includes `edges` and optional **`broken`** (internal-looking links that did not resolve). Written to **`public/graph.json`** during dev (site root in production); regenerated when `src/content` changes. Doc pages list **연결된 문서** (out/in) and show unresolved hints when needed.

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
| `pnpm test` | Vitest (includes `packages/barodoc/src/runtime/project.test.ts` for quick-mode helpers) |

## Development and testing

For **testing with the docs site**, **testing with my-docs (quick mode)**, and **plugin development** (local workflow, testing in docs/my-docs, releasing), see **[DEVELOPMENT.md](./DEVELOPMENT.md)**.
