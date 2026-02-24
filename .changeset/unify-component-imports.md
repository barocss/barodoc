---
"@barodoc/theme-docs": minor
"barodoc": patch
---

Unify all component imports to use `@barodoc/theme-docs` instead of deep sub-paths

- Convert remaining .astro components to TSX: Card, CardGroup, CodeItem, ApiParams, ApiParam, ApiResponse
- Export all new components from `@barodoc/theme-docs`
- Separate theme integration into `@barodoc/theme-docs/theme` entry point to prevent native module bundling in client builds
- Update all 56 MDX documentation files to use unified import paths
