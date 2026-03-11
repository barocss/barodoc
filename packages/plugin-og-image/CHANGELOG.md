# @barodoc/plugin-og-image

## 8.0.0

### Patch Changes

- Updated dependencies [c5233ab]
  - @barodoc/core@9.0.0

## 7.0.0

### Patch Changes

- 27db93c: Fix plugin build:done hook dispatch and plugin output issues.

  - **Core integration**: Add `astro:build:start` and `astro:build:done` hooks to correctly dispatch plugin lifecycle hooks.
  - **OG Image plugin**: Fix hook signature, output directory, and font loading (TTF via Google Fonts API).
  - **LLMs-TXT plugin**: Fix content scanning to find all markdown files recursively.
  - **RSS plugin**: Refactor to use static endpoint with virtual module config, eliminating `src/pages` file generation.

- Updated dependencies [27db93c]
- Updated dependencies [27db93c]
  - @barodoc/core@8.0.0

## 6.0.0

### Patch Changes

- Updated dependencies [b4811da]
- Updated dependencies [00de675]
  - @barodoc/core@7.0.0

## 5.0.0

### Patch Changes

- Updated dependencies [a3ea90d]
  - @barodoc/core@6.0.0

## 4.0.0

### Patch Changes

- Updated dependencies [84d4c7f]
  - @barodoc/core@5.0.0

## 3.0.0

### Major Changes

- 13e9cc4: Sync package versions to v3.0.0

  - Refactor create-barodoc to thin wrapper delegating to `npx barodoc create`
  - Remove redundant scaffolding logic and unused dependencies (fs-extra, picocolors)
  - Bump create-barodoc and @barodoc/plugin-og-image to align with other packages

## 2.0.0

### Patch Changes

- Updated dependencies
  - @barodoc/core@3.0.0

## 1.0.0

### Patch Changes

- Updated dependencies [1a4db6e]
  - @barodoc/core@2.0.0
