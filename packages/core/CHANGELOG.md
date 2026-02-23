# @barodoc/core

## 6.0.0

### Minor Changes

- a3ea90d: Add 12 new features across 4 phases

  **Phase 1: Quick Wins**

  - Image zoom/lightbox with medium-zoom (auto-applied to all prose images)
  - Video embed component (YouTube, Vimeo, Loom auto-detect)
  - Math/KaTeX support via remark-math + rehype-katex ($inline$ and $$block$$)
  - Reading time display on docs pages
  - Keyboard shortcuts (Cmd/Ctrl+K search, arrow keys navigation, ? help modal)

  **Phase 2: Content Types**

  - Blog system with content collection, card grid index, and dedicated BlogLayout
  - Changelog page with timeline UI and version badge grouping

  **Phase 3: Plugins**

  - @barodoc/plugin-docsearch: Algolia DocSearch integration
  - @barodoc/plugin-rss: RSS feed generation from blog/changelog collections
  - @barodoc/plugin-pwa: PWA manifest and service worker for offline support
  - Page contributors component using git log with Gravatar avatars

  **Phase 4: Major Features**

  - Doc versioning with folder-based version management and VersionSwitcher dropdown
  - @barodoc/plugin-openapi: OpenAPI spec auto-generation into MDX pages
  - API Playground component for interactive API testing with form builder

## 5.0.0

### Minor Changes

- 84d4c7f: Overhaul theme color system and fix MDX component issues

  **@barodoc/core**

  - Replace `theme.colors.primary` with `accent` / `gray` configuration
  - Add OKLCH-based 50–950 palette generation from a single hex value
  - Support light/dark mode separate accent colors
  - Add gray scale presets: zinc, slate, neutral, stone, gray

  **@barodoc/theme-docs**

  - Migrate all components from hardcoded Tailwind classes to CSS custom properties (`--bd-*`)
  - Fix CodeGroup duplicate tabs on `astro:page-load` re-execution
  - Fix Mermaid `dayjs` CJS/ESM interop error via `vite.optimizeDeps.include`
  - Redesign Steps component with CSS counters for automatic numbering and grid-based layout
  - Add Tooltip component using Radix UI Portal rendered to `document.body`
  - Update global.css with full design token system

## 3.0.0

### Minor Changes

- Content-site separation and AI agent data pipeline

  - Standardize frontmatter schema (tags, related, category, difficulty) exported from @barodoc/core
  - Add overrides/ directory support with Vite alias registration
  - New CLI commands: barodoc manifest (--lite, --chunks), barodoc schema
  - Extend barodoc check with related link validation and recursive scanning
  - Fix llms-full.txt to preserve code blocks
  - Update CLAUDE.md agent rules

## 2.0.0

### Minor Changes

- 1a4db6e: Add Edit on GitHub link, breadcrumb navigation, last updated timestamp, announcement banner, feedback widget, OG/Twitter meta tags, and plugin-og-image scaffold. New config options: editLink, lastUpdated, announcement, feedback.

## 1.0.1

### Patch Changes

- 647edbf: CodeGroup/CodeItem refactor, line numbers option, and code block line spacing. Add `CodeItem` for tabbed code blocks with per-tab titles. Add `lineNumbers` to barodoc config; theme applies Shiki transformer and CSS when enabled. Code block CSS: tighter line-height, `code` as flex column, `span.line` without extra margin.

## 1.0.0

### Minor Changes

- 125c634: Wire barodoc.config.json plugins into integration: load plugins, run config:loaded hook, merge plugin Astro integrations. Add plugins to config schema.
