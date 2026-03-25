# @barodoc/plugin-rss

## 10.0.3

### Patch Changes

- Updated dependencies [9d46ac2]
  - @barodoc/core@10.0.9

## 10.0.2

### Patch Changes

- Updated dependencies [f5b9706]
  - @barodoc/core@10.0.8

## 10.0.1

### Patch Changes

- Updated dependencies [d8c580d]
  - @barodoc/core@10.0.7

## 10.0.0

### Patch Changes

- Updated dependencies [aceb877]
  - @barodoc/core@10.0.0

## 9.0.0

### Patch Changes

- Updated dependencies [c5233ab]
  - @barodoc/core@9.0.0

## 8.0.1

### Patch Changes

- 0dc21fc: fix: add ambient type declaration for `astro:content` and type getCollection in feed

  Resolves TS2307 (Cannot find module 'astro:content') when type-checking plugin-rss. The virtual module is declared in `src/astro-env.d.ts`; feed.ts now passes explicit generics to getCollection for blog/changelog entry data.

## 8.0.0

### Patch Changes

- 27db93c: Fix plugin build:done hook dispatch and plugin output issues.

  - **Core integration**: Add `astro:build:start` and `astro:build:done` hooks to correctly dispatch plugin lifecycle hooks.
  - **OG Image plugin**: Fix hook signature, output directory, and font loading (TTF via Google Fonts API).
  - **LLMs-TXT plugin**: Fix content scanning to find all markdown files recursively.
  - **RSS plugin**: Refactor to use static endpoint with virtual module config, eliminating `src/pages` file generation.

- Updated dependencies [27db93c]
- Updated dependencies [27db93c]
  - @barodoc/core@8.0.0

## 7.0.0

### Patch Changes

- Updated dependencies [b4811da]
- Updated dependencies [00de675]
  - @barodoc/core@7.0.0

## 6.0.0

### Patch Changes

- Updated dependencies [a3ea90d]
  - @barodoc/core@6.0.0
