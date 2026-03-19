---
"@barodoc/core": minor
"@barodoc/theme-docs": minor
"barodoc": minor
"@barodoc/plugin-og-image": patch
"@barodoc/plugin-llms-txt": minor
---

feat: sidebar hierarchy (nested nav) in barodoc.config.json

- `navigation[].pages` supports `{ label, pages }` for expandable sidebar groups
- Use `label:ko` etc. for localized labels
- Sidebar: item-level collapse, full-width docs layout; prev/next and category use flattened slugs
- Header.astro mobile nav and plugins/CLI updated for nested config. Closes #128
