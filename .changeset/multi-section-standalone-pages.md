---
"@barodoc/core": minor
"@barodoc/theme-docs": minor
"barodoc": minor
---

Add multi-section docs and standalone pages support.

- **Multiple sections**: Add `sections` config to create additional doc sections (e.g. `/help/*`, `/guides/*`) each with independent sidebar navigation.
- **Standalone pages**: Create `pages/` directory for sidebar-free content pages (e.g. `/about`, `/pricing`) using a single-column article layout.
- **Section-aware sidebar**: Sidebar and breadcrumbs dynamically adapt to the current section context.
- **CLI root fix**: Fix project root detection in `serve` and `build` commands so `barodoc.config.json` and content directories are correctly resolved.
- **Dev server SSR fix**: Use targeted SSR noExternal for `@barodoc/*` packages instead of blanket `true` to prevent CJS/ESM errors in dev mode.
