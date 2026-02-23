# barodoc

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
