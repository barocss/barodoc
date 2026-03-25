---
"@barodoc/core": patch
"@barodoc/theme-docs": patch
"barodoc": patch
---

feat: reading mode, slide mode, and smoother in-doc navigation

- **Reading mode** — Toggle beside the article hides chrome (sidebar, TOC, pre/post article); comfortable fluid width; prev/next as side chevrons; `localStorage` + `?read=1`.
- **Slide mode** — Optional `slides: true` frontmatter; full-screen deck split by `---`; hover/focus chrome; prev/next motion; `?slide=` URL sync; hide nav category label inside slides.
- **View transitions** — `ClientRouter` in the docs shell; `ThemeScript` reapplies theme and reading mode on `astro:after-swap` to avoid flash between pages.
- **CLI** — `barodoc create` adds `docs/en/example-slides.md` and nav entry; agent rules example updated.
- **Core** — Content schema `slides`; i18n strings for slide UI and view toolbar.
