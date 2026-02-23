---
"@barodoc/core": minor
"@barodoc/theme-docs": minor
---

Overhaul theme color system and fix MDX component issues

**@barodoc/core**
- Replace `theme.colors.primary` with `accent` / `gray` configuration
- Add OKLCH-based 50–950 palette generation from a single hex value
- Support light/dark mode separate accent colors
- Add gray scale presets: zinc, slate, neutral, stone, gray

**@barodoc/theme-docs**
- Migrate all components from hardcoded Tailwind classes to CSS custom properties (`--bd-*`)
- Fix CodeGroup duplicate tabs on `astro:page-load` re-execution
- Fix Mermaid `dayjs` CJS/ESM interop error via `vite.optimizeDeps.include`
- Redesign Steps component with CSS counters for automatic numbering and grid-based layout
- Add Tooltip component using Radix UI Portal rendered to `document.body`
- Update global.css with full design token system
