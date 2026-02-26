---
"@barodoc/theme-docs": patch
---

fix: ensure dist/theme.js is included in published package

Added `prepublishOnly` script to guarantee the theme build output is present
before publishing. The 8.0.0 release was missing `dist/theme.js` because
`theme-docs` was not included in `build:packages` at that time.
