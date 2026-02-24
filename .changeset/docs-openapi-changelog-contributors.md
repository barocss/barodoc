---
"@barodoc/plugin-openapi": minor
"@barodoc/theme-docs": minor
---

Add multi-spec OpenAPI support, changelog content type, blog author avatars, contributors display, and comprehensive documentation updates

- **plugin-openapi**: `specFile` now accepts an array of `OpenApiSpecEntry` objects for projects with multiple API specs, each with its own `basePath`, `baseUrl`, and `groupBy`
- **theme-docs**: Blog posts support `avatar` field in frontmatter, displayed next to author name on index and post pages
- **theme-docs**: Contributors section at page footer shows most recent editor avatar with +N count badge for additional contributors
- **theme-docs**: Fix contributors file path resolution so git history is properly read
- **theme-docs**: Fix code copy button styling on blog pages by including CodeCopy component in BlogLayout
- **docs**: Add changelog content with 6 sample entries (v0.1.0–v0.6.0) and Changelog tab in header
- **docs**: Comprehensive OpenAPI plugin guide with multi-spec examples and full options reference
- **docs**: Updated content structure and configuration guides covering all new features (EN/KO)
