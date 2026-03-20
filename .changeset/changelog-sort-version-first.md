---
"@barodoc/theme-docs": patch
---

fix: Changelog sort by version first (newest on top), correct compareVersion order

- Use compareVersion(a, b) so newer version is placed first; sort by version desc then date desc. Closes #141
