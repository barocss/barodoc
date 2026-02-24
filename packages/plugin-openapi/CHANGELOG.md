# @barodoc/plugin-openapi

## 8.0.0

### Patch Changes

- Updated dependencies [27db93c]
- Updated dependencies [27db93c]
  - @barodoc/core@8.0.0

## 7.0.0

### Minor Changes

- 36b58fd: Add multi-spec OpenAPI support, changelog content type, blog author avatars, contributors display, and comprehensive documentation updates

  - **plugin-openapi**: `specFile` now accepts an array of `OpenApiSpecEntry` objects for projects with multiple API specs, each with its own `basePath`, `baseUrl`, and `groupBy`
  - **theme-docs**: Blog posts support `avatar` field in frontmatter, displayed next to author name on index and post pages
  - **theme-docs**: Contributors section at page footer shows most recent editor avatar with +N count badge for additional contributors
  - **theme-docs**: Fix contributors file path resolution so git history is properly read
  - **theme-docs**: Fix code copy button styling on blog pages by including CodeCopy component in BlogLayout
  - **docs**: Add changelog content with 6 sample entries (v0.1.0–v0.6.0) and Changelog tab in header
  - **docs**: Comprehensive OpenAPI plugin guide with multi-spec examples and full options reference
  - **docs**: Updated content structure and configuration guides covering all new features (EN/KO)

### Patch Changes

- Updated dependencies [b4811da]
- Updated dependencies [00de675]
  - @barodoc/core@7.0.0

## 6.1.0

### Minor Changes

- 84483b3: Enhance API Playground with enum parameter dropdowns, JSON body validation, response size display, Basic Auth support, and request history stored in IndexedDB. Add ApiEndpoint component and comprehensive API documentation styling with endpoint TOC, code snippets, and theme-consistent response rendering.

## 6.0.0

### Patch Changes

- Updated dependencies [a3ea90d]
  - @barodoc/core@6.0.0
