# @barodoc/plugin-raw-md

## 9.0.0

### Patch Changes

- Updated dependencies [c5233ab]
  - @barodoc/core@9.0.0

## 8.1.0

### Minor Changes

- 098075c: feat: add @barodoc/plugin-raw-md — serve raw markdown via .md URL suffix

  Append `.md` to any page URL to get the raw markdown source instead of HTML.
  AI agents can fetch clean markdown directly, enabling faster and more accurate
  content consumption without HTML parsing.

  - Build mode: generates static `.md` files in the output directory
  - Dev mode: Vite middleware intercepts `.md` requests and serves source files
  - Cleans MDX component tags while preserving markdown formatting and code blocks
  - Supports i18n locales and custom sections

### Patch Changes

- 098075c: **@barodoc/plugin-raw-md**

  - Fix dev server: serve `.md` URLs by prepending middleware (post hook) so requests are handled before Astro/Vite
  - When `collections` is omitted, run for all collections: custom mode = all dirs under `src/content/`, quick mode = docs + blog + changelog + configured sections that exist

  **barodoc**

  - Quick mode: treat `dir` missing or `"."` as "auto-detect docs dir" to avoid "copy to subdirectory of itself" when running `barodoc serve` or `barodoc build .` from project root

## 0.2.0

### Minor Changes

- a8901a4: feat: add @barodoc/plugin-raw-md — serve raw markdown via .md URL suffix

  Append `.md` to any page URL to get the raw markdown source instead of HTML.
  AI agents can fetch clean markdown directly, enabling faster and more accurate
  content consumption without HTML parsing.

  - Build mode: generates static `.md` files in the output directory
  - Dev mode: Vite middleware intercepts `.md` requests and serves source files
  - Cleans MDX component tags while preserving markdown formatting and code blocks
  - Supports i18n locales and custom sections
