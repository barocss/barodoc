# barodoc

## 8.1.0

### Patch Changes

- 098075c: **@barodoc/plugin-raw-md**

  - Fix dev server: serve `.md` URLs by prepending middleware (post hook) so requests are handled before Astro/Vite
  - When `collections` is omitted, run for all collections: custom mode = all dirs under `src/content/`, quick mode = docs + blog + changelog + configured sections that exist

  **barodoc**

  - Quick mode: treat `dir` missing or `"."` as "auto-detect docs dir" to avoid "copy to subdirectory of itself" when running `barodoc serve` or `barodoc build .` from project root

## 8.0.2

### Patch Changes

- Updated dependencies [6a05e4f]
  - @barodoc/theme-docs@8.0.2

## 8.0.1

### Patch Changes

- Updated dependencies [4acf950]
  - @barodoc/theme-docs@8.0.1

## 8.0.0

### Minor Changes

- 27db93c: Add multi-section docs and standalone pages support.

  - **Multiple sections**: Add `sections` config to create additional doc sections (e.g. `/help/*`, `/guides/*`) each with independent sidebar navigation.
  - **Standalone pages**: Create `pages/` directory for sidebar-free content pages (e.g. `/about`, `/pricing`) using a single-column article layout.
  - **Section-aware sidebar**: Sidebar and breadcrumbs dynamically adapt to the current section context.
  - **CLI root fix**: Fix project root detection in `serve` and `build` commands so `barodoc.config.json` and content directories are correctly resolved.
  - **Dev server SSR fix**: Use targeted SSR noExternal for `@barodoc/*` packages instead of blanket `true` to prevent CJS/ESM errors in dev mode.

### Patch Changes

- Updated dependencies [27db93c]
- Updated dependencies [27db93c]
  - @barodoc/core@8.0.0
  - @barodoc/theme-docs@8.0.0
  - @barodoc/plugin-og-image@7.0.0
  - @barodoc/plugin-llms-txt@8.0.0
  - @barodoc/plugin-rss@8.0.0
  - @barodoc/plugin-analytics@8.0.0
  - @barodoc/plugin-docsearch@8.0.0
  - @barodoc/plugin-openapi@8.0.0
  - @barodoc/plugin-pwa@8.0.0
  - @barodoc/plugin-search@8.0.0
  - @barodoc/plugin-sitemap@8.0.0

## 7.2.1

### Patch Changes

- 44a11cb: Fix MDX component imports in Quick Mode by enabling Vite preserveSymlinks

## 7.2.0

### Minor Changes

- b9a0f5e: Auto-update Quick Mode dependencies when CLI version changes

  - Track CLI version in `.barodoc/.cli-version` marker file
  - Automatically reinstall dependencies when a new CLI version is detected
  - Pin `@barodoc/core` and `@barodoc/theme-docs` to the current major version instead of hardcoded `^1.0.0`

## 7.1.1

### Patch Changes

- Updated dependencies [c190a89]
  - @barodoc/theme-docs@7.1.1

## 7.1.0

### Patch Changes

- 2d6b6a6: Unify all component imports to use `@barodoc/theme-docs` instead of deep sub-paths

  - Convert remaining .astro components to TSX: Card, CardGroup, CodeItem, ApiParams, ApiParam, ApiResponse
  - Export all new components from `@barodoc/theme-docs`
  - Separate theme integration into `@barodoc/theme-docs/theme` entry point to prevent native module bundling in client builds
  - Update all 56 MDX documentation files to use unified import paths

- Updated dependencies [2d6b6a6]
  - @barodoc/theme-docs@7.1.0

## 7.0.0

### Patch Changes

- 00de675: Add unit test infrastructure with Vitest (38 tests), fix CI pipeline, add migration guide and troubleshooting docs, add sample blog posts
- Updated dependencies [36b58fd]
- Updated dependencies [b4811da]
- Updated dependencies [00de675]
  - @barodoc/theme-docs@7.0.0
  - @barodoc/core@7.0.0

## 6.1.1

### Patch Changes

- 88a8b12: Redesign default logo with modern gradient blue document icon

## 6.1.0

### Patch Changes

- Updated dependencies [84483b3]
  - @barodoc/theme-docs@6.1.0

## 6.0.0

### Patch Changes

- Updated dependencies [a3ea90d]
  - @barodoc/core@6.0.0
  - @barodoc/theme-docs@6.0.0

## 5.0.0

### Patch Changes

- Updated dependencies [84d4c7f]
  - @barodoc/core@5.0.0
  - @barodoc/theme-docs@5.0.0

## 4.0.1

### Patch Changes

- a62607e: Fix missing dependencies in quick mode temporary project

  Add @astrojs/mdx, @astrojs/react, @tailwindcss/vite, @tailwindcss/typography, and tailwindcss to the generated .barodoc/package.json so that `barodoc serve` and `barodoc build` work in zero-config mode.

## 3.0.0

### Minor Changes

- Content-site separation and AI agent data pipeline

  - Standardize frontmatter schema (tags, related, category, difficulty) exported from @barodoc/core
  - Add overrides/ directory support with Vite alias registration
  - New CLI commands: barodoc manifest (--lite, --chunks), barodoc schema
  - Extend barodoc check with related link validation and recursive scanning
  - Fix llms-full.txt to preserve code blocks
  - Update CLAUDE.md agent rules

### Patch Changes

- Updated dependencies
  - @barodoc/core@3.0.0
  - @barodoc/theme-docs@3.0.0

## 2.0.0

### Patch Changes

- Updated dependencies [1a4db6e]
  - @barodoc/core@2.0.0
  - @barodoc/theme-docs@2.0.0

## 1.1.0

### Minor Changes

- be7cfcf: feat: add `barodoc check`, CLAUDE.md generation, and `plugin-llms-txt`

  ### `barodoc check`

  New CLI command for validating documentation integrity:

  - Detects navigation entries that reference missing files
  - Detects orphaned files not registered in navigation
  - Warns about missing `description` frontmatter
  - `--fix` flag auto-creates stub markdown files and syncs orphan files into `barodoc.config.json` navigation (replaces the need for a separate `sync` command)

  ```bash
  barodoc check          # report issues
  barodoc check --fix    # auto-fix
  ```

  ### CLAUDE.md auto-generation

  `barodoc init` and `barodoc create` now generate a `CLAUDE.md` in the project root. This file teaches AI assistants (Claude, Cursor, GitHub Copilot, etc.) the exact rules for generating barodoc-compatible markdown:

  - Frontmatter schema (`title`, `description`)
  - MDX component syntax (`Callout`, `Steps`, `Card`, `CardGroup`, `CodeGroup`)
  - Navigation registration conventions
  - i18n file structure
  - Recommended workflow for adding new pages

  ### `@barodoc/plugin-llms-txt` (new package)

  New plugin that generates AI-friendly text files during `barodoc build`:

  - `llms.txt` — site summary + page links in [llmstxt.org](https://llmstxt.org) spec format
  - `llms-full.txt` — full page content for RAG and AI context injection

  ```json
  {
    "plugins": [
      [
        "@barodoc/plugin-llms-txt",
        {
          "description": "My project docs",
          "links": [{ "title": "GitHub", "url": "https://github.com/..." }]
        }
      ]
    ]
  }
  ```

## 1.0.1

### Patch Changes

- Updated dependencies [647edbf]
  - @barodoc/core@1.0.1
  - @barodoc/theme-docs@1.0.1

## 1.0.0

### Patch Changes

- Updated dependencies [0443a12]
- Updated dependencies [125c634]
  - @barodoc/theme-docs@1.0.0
  - @barodoc/core@1.0.0
