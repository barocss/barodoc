---
"@barodoc/theme-docs": patch
---

fix: Changelog page sort by version (newest first), move version utils to lib

- Sort changelog entries by date desc, then by semver desc so same-date entries (e.g. 10.0.0 vs 10.0.1) show newest first.
- Add lib/version.ts (parseVersion, compareVersion) and use from changelog index. Closes #138
