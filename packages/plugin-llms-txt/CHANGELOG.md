# @barodoc/plugin-llms-txt

## 10.0.0

### Minor Changes

- aceb877: feat: sidebar hierarchy (nested nav) in barodoc.config.json

  - `navigation[].pages` supports `{ label, pages }` for expandable sidebar groups (Mintlify-style)
  - Use `label:ko` etc. for localized labels
  - Sidebar: item-level collapse, full-width docs layout; prev/next and category use flattened slugs
  - Header.astro mobile nav and plugins/CLI updated for nested config. Closes #128

### Patch Changes

- Updated dependencies [aceb877]
  - @barodoc/core@10.0.0

## 9.0.0

### Patch Changes

- Updated dependencies [c5233ab]
  - @barodoc/core@9.0.0

## 8.0.0

### Patch Changes

- 27db93c: Fix plugin build:done hook dispatch and plugin output issues.

  - **Core integration**: Add `astro:build:start` and `astro:build:done` hooks to correctly dispatch plugin lifecycle hooks.
  - **OG Image plugin**: Fix hook signature, output directory, and font loading (TTF via Google Fonts API).
  - **LLMs-TXT plugin**: Fix content scanning to find all markdown files recursively.
  - **RSS plugin**: Refactor to use static endpoint with virtual module config, eliminating `src/pages` file generation.

- Updated dependencies [27db93c]
- Updated dependencies [27db93c]
  - @barodoc/core@8.0.0

## 7.0.0

### Patch Changes

- Updated dependencies [b4811da]
- Updated dependencies [00de675]
  - @barodoc/core@7.0.0

## 6.0.0

### Patch Changes

- Updated dependencies [a3ea90d]
  - @barodoc/core@6.0.0

## 5.0.0

### Patch Changes

- Updated dependencies [84d4c7f]
  - @barodoc/core@5.0.0

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

## 2.0.0

### Patch Changes

- Updated dependencies [1a4db6e]
  - @barodoc/core@2.0.0

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
