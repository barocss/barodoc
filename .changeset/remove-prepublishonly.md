---
"@barodoc/theme-docs": patch
---

chore: remove redundant prepublishOnly script

The release pipeline already runs `build:packages` before `changeset publish`,
so per-package prepublishOnly was causing a duplicate build. Removed to align
with the convention used by all other packages.
