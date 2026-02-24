# @barodoc/theme-docs

## 7.1.1

### Patch Changes

- c190a89: Fix CodeGroup tabs not displaying titles - reverted to Astro component for client-side interactivity

## 7.1.0

### Minor Changes

- 2d6b6a6: Unify all component imports to use `@barodoc/theme-docs` instead of deep sub-paths

  - Convert remaining .astro components to TSX: Card, CardGroup, CodeItem, ApiParams, ApiParam, ApiResponse
  - Export all new components from `@barodoc/theme-docs`
  - Separate theme integration into `@barodoc/theme-docs/theme` entry point to prevent native module bundling in client builds
  - Update all 56 MDX documentation files to use unified import paths

## 7.0.0

### Minor Changes

- 36b58fd: Add multi-spec OpenAPI support, changelog content type, blog author avatars, contributors display, and comprehensive documentation updates

  - **plugin-openapi**: `specFile` now accepts an array of `OpenApiSpecEntry` objects for projects with multiple API specs, each with its own `basePath`, `baseUrl`, and `groupBy`
  - **theme-docs**: Blog posts support `avatar` field in frontmatter, displayed next to author name on index and post pages
  - **theme-docs**: Contributors section at page footer shows most recent editor avatar with +N count badge for additional contributors
  - **theme-docs**: Fix contributors file path resolution so git history is properly read
  - **theme-docs**: Fix code copy button styling on blog pages by including CodeCopy component in BlogLayout
  - **docs**: Add changelog content with 6 sample entries (v0.1.0–v0.6.0) and Changelog tab in header
  - **docs**: Comprehensive OpenAPI plugin guide with multi-spec examples and full options reference
  - **docs**: Updated content structure and configuration guides covering all new features (EN/KO)

- b4811da: Add configurable header tabs navigation for top-level section switching (Docs, Blog, API Reference, etc.)

### Patch Changes

- Updated dependencies [b4811da]
- Updated dependencies [00de675]
  - @barodoc/core@7.0.0

## 6.1.0

### Minor Changes

- 84483b3: Enhance API Playground with enum parameter dropdowns, JSON body validation, response size display, Basic Auth support, and request history stored in IndexedDB. Add ApiEndpoint component and comprehensive API documentation styling with endpoint TOC, code snippets, and theme-consistent response rendering.

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

### Patch Changes

- Updated dependencies [a3ea90d]
  - @barodoc/core@6.0.0

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

### Patch Changes

- Updated dependencies [84d4c7f]
  - @barodoc/core@5.0.0

## 3.0.0

### Patch Changes

- Updated dependencies
  - @barodoc/core@3.0.0

## 2.0.0

### Minor Changes

- 1a4db6e: Add Edit on GitHub link, breadcrumb navigation, last updated timestamp, announcement banner, feedback widget, OG/Twitter meta tags, and plugin-og-image scaffold. New config options: editLink, lastUpdated, announcement, feedback.

### Patch Changes

- Updated dependencies [1a4db6e]
  - @barodoc/core@2.0.0

## 1.0.1

### Patch Changes

- 647edbf: CodeGroup/CodeItem refactor, line numbers option, and code block line spacing. Add `CodeItem` for tabbed code blocks with per-tab titles. Add `lineNumbers` to barodoc config; theme applies Shiki transformer and CSS when enabled. Code block CSS: tighter line-height, `code` as flex column, `span.line` without extra margin.
- Updated dependencies [647edbf]
  - @barodoc/core@1.0.1

## 1.0.0

### Patch Changes

- 0443a12: Add custom 404 page and align docs with CLI (zero-config) vs manual Astro setup
- Updated dependencies [125c634]
  - @barodoc/core@1.0.0
