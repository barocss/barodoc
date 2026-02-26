---
"@barodoc/theme-docs": patch
---

fix: satisfy Shiki transformer type by adding addClassToHast to line-numbers transformer

Resolves TS2352: the line-numbers transformer now includes addClassToHast so it matches the expected Shiki transformer interface. Implemented addClassToHast helper and attached it to the returned object.
