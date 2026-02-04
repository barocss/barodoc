# @barodoc/core

## 1.0.1

### Patch Changes

- 647edbf: CodeGroup/CodeItem refactor, line numbers option, and code block line spacing. Add `CodeItem` for tabbed code blocks with per-tab titles. Add `lineNumbers` to barodoc config; theme applies Shiki transformer and CSS when enabled. Code block CSS: tighter line-height, `code` as flex column, `span.line` without extra margin.

## 1.0.0

### Minor Changes

- 125c634: Wire barodoc.config.json plugins into integration: load plugins, run config:loaded hook, merge plugin Astro integrations. Add plugins to config schema.
