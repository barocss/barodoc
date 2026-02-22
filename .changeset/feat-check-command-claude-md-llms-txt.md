---
"barodoc": minor
"@barodoc/plugin-llms-txt": minor
---

feat: add `barodoc check`, CLAUDE.md generation, and `plugin-llms-txt`

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
    ["@barodoc/plugin-llms-txt", {
      "description": "My project docs",
      "links": [{ "title": "GitHub", "url": "https://github.com/..." }]
    }]
  ]
}
```
