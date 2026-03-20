# @barodoc/plugin-llms-txt

Generate [llms.txt](https://llmstxt.org) and optional `llms-full.txt` at build time so AI assistants and LLMs can consume your documentation as plain text.

## Install

```bash
pnpm add @barodoc/plugin-llms-txt
```

## Config

```json
{
  "plugins": [
    ["@barodoc/plugin-llms-txt", {
      "description": "Documentation for My Project",
      "full": true,
      "links": [
        { "title": "GitHub", "url": "https://github.com/user/repo" }
      ]
    }]
  ]
}
```

- **description** — Site description in the llms.txt header (default: config name).
- **full** — Generate `llms-full.txt` with full page content (default: `true`).
- **links** — Extra links to include (e.g. repo, API).

## Output

Files are written to the **build output root** (e.g. `dist/`), so after deploy you get:

- `https://your-docs.com/llms.txt` — Summary (titles, descriptions, links).
- `https://your-docs.com/llms-full.txt` — Full content (when `full: true`).

The plugin does not change `robots.txt`. AI tools and MCP servers can fetch these URLs by convention.

## Docs

Full guide: [LLMs.txt Plugin](https://barodoc.dev/guides/plugins/llms-txt).
