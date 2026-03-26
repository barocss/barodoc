---
name: barodoc-dev
description: Barodoc monorepo development and testing workflow. Use whenever working on the barodoc repo — building packages, running the docs site or my-docs, testing plugins, or type-checking. Prefer this skill when the user says they're developing barodoc, testing locally, debugging the docs site, or verifying plugin behavior in docs or my-docs.
---

# Barodoc Development & Testing

This skill covers how to build, run, and verify the Barodoc monorepo and plugins locally. For CLI usage in end-user projects, see **barodoc-cli**. For config and plugins, see **barodoc-config** and **barodoc-plugins**.

## Prerequisites (run first)

From the **barodoc** repo root:

```bash
pnpm install
pnpm build:packages
```

`build:packages` builds core, theme-docs, barodoc CLI, and all plugins. Run it after changing any package, then test.

---

## 1. Testing with the docs site

The **docs** workspace is a full Astro project. Use it to test the framework and plugins in custom mode.

| Goal | Command |
|------|---------|
| Dev server | `pnpm dev` (port 4321 or next available) |
| Production build | `pnpm build` (output in `docs/dist`) |
| Build + preview (full behavior) | `pnpm build:packages && pnpm build && pnpm preview` |

**Why build + preview:** In the monorepo, `pnpm dev` can fail to load theme-docs React islands (e.g. mobile menu) due to dev-only `/@fs/` handling. For full navigation and mobile menu, use build then preview.

**Config:** `docs/barodoc.config.json`. To test a plugin, add it to the `plugins` array.

**Type-check (all packages):** Run after `astro sync` so content types exist:

```bash
pnpm --filter docs exec astro sync
pnpm -r exec tsc --noEmit
```

---

## 2. Testing with my-docs (quick mode)

**my-docs** is a separate project (e.g. sibling `barocss/my-docs`) with only Markdown and `barodoc.config.json`. The CLI runs in quick mode via a project under `my-docs/.barodoc/`: it runs **`npm install`** there (isolated `package.json`, not a symlink to the monorepo root `node_modules`). From the Barodoc repo, `@barodoc/*` deps are installed via **`npm pack`** tarballs with `workspace:*` rewritten to semver. First run needs **npm** on `PATH` and network; see **AGENTS.md** for details.

### From the barodoc repo

```bash
cd barodoc
pnpm build:packages
pnpm barodoc serve ../my-docs
pnpm barodoc build ../my-docs -o ../my-docs/dist
pnpm barodoc preview ../my-docs   # optional: preview production build
```

### From the my-docs directory (no install in my-docs)

```bash
cd my-docs
node ../barodoc/packages/barodoc/dist/cli.js serve
node ../barodoc/packages/barodoc/dist/cli.js build . -o dist
```

**Plugin in my-docs:** Add to `my-docs/barodoc.config.json` → `plugins`. Serve/build from barodoc CLI; extra `@barodoc/*` plugins are merged into the temp `package.json` and resolved like other workspace packages when running from the monorepo.

**Quick-mode unit tests:** `pnpm test` runs Vitest including `packages/barodoc/src/runtime/project.test.ts` (dependency manifest, monorepo root detection, `generateAstroConfigFile` snippet).

---

## 3. Plugin development

- **Location:** `packages/plugin-<name>/` (e.g. `plugin-raw-md`, `plugin-rss`).
- **Build:** `pnpm --filter @barodoc/plugin-<name> build` then `pnpm --filter barodoc build`.

**Test in docs:** Add plugin to `docs/barodoc.config.json`, run `pnpm dev` (or build+preview) and verify.

**Test in my-docs:** Add plugin to `my-docs/barodoc.config.json`, run `pnpm barodoc serve ../my-docs` and `pnpm barodoc build ../my-docs -o ../my-docs/dist`; confirm dev and build both work.

**Asset content (PDF, RST, etc.):** Put files in the docs content tree (e.g. `docs/src/content/docs/en/`), add slug to `barodoc.config.json` → navigation `pages`, then open the asset URL (e.g. `/docs/guide` for `guide.pdf`).

---

## Quick reference

| Goal | Command / location |
|------|--------------------|
| Build all packages | `pnpm build:packages` |
| Dev server (docs) | `pnpm dev` |
| Full behavior (docs) | `pnpm build:packages && pnpm build && pnpm preview` |
| Serve my-docs from repo | `pnpm barodoc serve ../my-docs` |
| Build my-docs from repo | `pnpm barodoc build ../my-docs -o ../my-docs/dist` |
| Type-check | `pnpm --filter docs exec astro sync` then `pnpm -r exec tsc --noEmit` |
| Unit tests (incl. quick mode manifest) | `pnpm test` |
| Plugin config (docs) | `docs/barodoc.config.json` → `plugins` |
| Plugin config (my-docs) | `my-docs/barodoc.config.json` → `plugins` |

For more detail (asset viewers, deploy, ECC setup), see **DEVELOPMENT.md** in the repo.
