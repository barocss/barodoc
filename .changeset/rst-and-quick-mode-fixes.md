---
"@barodoc/theme-docs": minor
"barodoc": minor
---

- **theme-docs**: Remove LaTeX/.tex support; render RST with rst-compiler (build-time). Dev: 404 for absolute/internal paths, redirect /docs to /docs/introduction.
- **barodoc**: Quick mode uses given dir as project root (fix serve/build ../my-docs). Generate content.config.ts with docs, blog, changelog, pages, and sections. Add rst-compiler dependency for quick mode.
