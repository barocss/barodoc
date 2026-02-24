---
"@barodoc/core": patch
"@barodoc/plugin-og-image": patch
"@barodoc/plugin-llms-txt": patch
"@barodoc/plugin-rss": patch
---

Fix plugin build:done hook dispatch and plugin output issues.

- **Core integration**: Add `astro:build:start` and `astro:build:done` hooks to correctly dispatch plugin lifecycle hooks.
- **OG Image plugin**: Fix hook signature, output directory, and font loading (TTF via Google Fonts API).
- **LLMs-TXT plugin**: Fix content scanning to find all markdown files recursively.
- **RSS plugin**: Refactor to use static endpoint with virtual module config, eliminating `src/pages` file generation.
