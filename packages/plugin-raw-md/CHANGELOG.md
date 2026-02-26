# @barodoc/plugin-raw-md

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
