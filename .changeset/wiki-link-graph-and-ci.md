---
"@barodoc/core": patch
"@barodoc/theme-docs": patch
---

feat(theme-docs): wiki link graph, `/graph` page, linked pages, and docs `check:graph`

- Build-time link graph from `[[wikilinks]]`, Markdown links, and MDX `<a href>`; emit `graph.json` with optional broken links.
- `/graph` route (Sigma.js) and **Linked pages** on doc layout; i18n strings for connection labels.
- Resolve default-locale paths (`/docs/guides/...` → `en/...`), legacy `/ko/docs/...` URLs, strip inline code from graph scans, and only report broken links under content sections.
- Docs: `pnpm --filter docs run check:graph` in CI; guides `graph-and-links` (EN/KO).
