---
"barodoc": patch
---

Quick mode: isolated `npm install` under `.barodoc/` (no symlink to monorepo root `node_modules`); monorepo `@barodoc/*` via `npm pack` with workspace-to-semver rewrite; dependency hash cache; file-based `astro.config.mjs`; `scheduler` for React; Vitest for `project.ts` helpers.
