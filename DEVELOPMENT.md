# Barodoc Development Guide

This document describes how to test Barodoc locally (docs site and my-docs quick mode) and how to develop plugins. It is intended for contributors and AI agents working on the repo.

**AI / Cursor:** To use [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) (ECC) with Cursor in this repo, run `./scripts/setup-ecc-cursor.sh` once. See [docs/ai-setup.md](docs/ai-setup.md).

---

## 1. Testing with the docs site (monorepo)

The **docs** workspace is a full Astro project that uses Barodoc. Use it to test the framework and plugins in “custom mode”.

### Prerequisites

```bash
cd barodoc
pnpm install
pnpm build:packages   # Build core, theme-docs, barodoc CLI, and all plugins
```

### Commands

| Command | Description |
|--------|-------------|
| `pnpm dev` | Start docs dev server (same as `pnpm --filter docs dev`). Default port 4321 (or next available). |
| `pnpm build` | Build the docs site (output in `docs/dist`). |
| `pnpm -r exec tsc --noEmit` | Type-check all packages. Run `pnpm --filter docs exec astro sync` first so `astro:content` types exist in docs. |

### Verifying behavior

- **Homepage**: Open `http://localhost:4321/` (or the port shown).
- **Docs pages**: e.g. `http://localhost:4321/docs/introduction`.
- **Raw .md (if using plugin-raw-md)**: e.g. `http://localhost:4321/docs/introduction.md` should return raw markdown with `Content-Type: text/markdown`.

**Full behavior (including mobile menu)**: In the monorepo, `pnpm dev` can fail to load theme-docs React islands (e.g. mobile hamburger menu) because of how dev-only `/@fs/` requests are handled. For local testing of the full site (navigation, mobile menu, etc.), use **build + preview** instead:

```bash
pnpm build:packages && pnpm build && pnpm preview
```

See `docs/plans/2026-03-09-mobile-menu-analysis.md` for details.

### Config

- Docs config: `docs/barodoc.config.json`.
- To test a plugin, add it to the `plugins` array there (e.g. `"@barodoc/plugin-raw-md"` or with options).

### Asset content (PDF, HTML, PPTX, etc.)

Asset files (e.g. `.pdf`, `.html`, `.pptx`, `.csv`, `.rst`, `.epub`, `.odt`, `.ipynb`) can live in the same content tree as Markdown (e.g. `src/content/docs/en/`). They are served at `/_content/<section>/<path>` and get dedicated viewer pages at `/<section>/<slug>` (same URL shape as docs).

- **Where to put files**: e.g. `docs/src/content/docs/en/guide.pdf` or `docs/src/content/docs/en/report.html`.
- **Sidebar / prev-next**: Add the asset slug to `barodoc.config.json` → `navigation.pages` (e.g. `"guide"` for `guide.pdf`) so it appears in the sidebar and in prev/next links.
- **Dev**: `/_content/docs/en/guide.pdf` is served by the theme’s dev middleware from `src/content`.
- **Build**: Asset files are copied to `dist/_content/<section>/<path>`; viewer pages are pre-rendered.

Supported extensions and viewer types are defined in `@barodoc/theme-docs` (see `assetExtensions.ts`).

---

## 2. Testing with my-docs (quick mode)

**my-docs** is a separate project (e.g. sibling of barodoc: `barocss/my-docs`) that has only Markdown and `barodoc.config.json` (no `package.json` or Astro setup). The Barodoc CLI runs in “quick mode”: it creates a temporary project under `my-docs/.barodoc/` and runs Astro from there.

### Prerequisites

1. Barodoc monorepo built:

   ```bash
   cd barodoc
   pnpm build:packages
   ```

2. my-docs layout (example):

   ```
   my-docs/
   ├── docs/           # or docs/en/, plus sections like help/
   │   └── en/
   │       └── introduction.md
   ├── barodoc.config.json
   └── (optional) public/, pages/, blog/, changelog/, sections (e.g. help/)
   ```

### Running from my-docs (no install in my-docs)

From the **my-docs** directory, point to the built CLI in the barodoc repo:

```bash
cd my-docs

# Dev server (dir defaults to "." → auto-detect docs dir, e.g. "docs")
node ../barodoc/packages/barodoc/dist/cli.js serve

# Or with explicit dir
node ../barodoc/packages/barodoc/dist/cli.js serve docs

# Build (output in my-docs/dist)
node ../barodoc/packages/barodoc/dist/cli.js build . -o dist
```

- **serve** with no args or `serve .`: uses `findDocsDir(my-docs)` (e.g. `docs`). Temp project: `my-docs/.barodoc/`.
- **build . -o dist**: same docs dir; build output is copied to `my-docs/dist/`.

### Testing asset viewers (PDF, RST, etc.) in my-docs

To verify asset content (e.g. RST, PDF) in quick mode:

1. In my-docs, add asset files under the docs tree (e.g. `docs/en/sample-rst.rst`, `docs/en/guide.pdf`).
2. Add the asset slugs to `barodoc.config.json` → `navigation` → `pages` (e.g. `"sample-rst"` for `sample-rst.rst`) so they appear in the sidebar.
3. From the barodoc repo run:

   ```bash
   pnpm build:packages
   pnpm barodoc serve ../my-docs
   ```

4. Open the asset page (e.g. `http://localhost:4321/docs/sample-rst`). For RST, the page should show compiled HTML; for PDF, the PDF viewer.
5. Optionally run a production build and preview:

   ```bash
   pnpm barodoc build ../my-docs -o ../my-docs/dist
   pnpm barodoc preview ../my-docs
   ```

### Running from barodoc repo (against my-docs)

From the **barodoc** repo you can also run the CLI with a path to my-docs (if you have it under the same parent):

```bash
cd barodoc
pnpm build:packages
pnpm barodoc serve ../my-docs    # or: node packages/barodoc/dist/cli.js serve ../my-docs
pnpm barodoc build ../my-docs -o ../my-docs/dist
```

### Testing a plugin in my-docs

1. Add the plugin to `my-docs/barodoc.config.json`:

   ```json
   "plugins": ["@barodoc/plugin-raw-md", ...]
   ```

2. Run serve/build from my-docs using the barodoc CLI path above. The CLI uses its own `node_modules` (from the monorepo), so workspace plugins (e.g. `@barodoc/plugin-raw-md`) are resolved from the barodoc build.

3. For **build**: check that expected artifacts appear (e.g. “Generated N raw .md files” and `.md` files under `my-docs/dist/`).
4. For **serve**: check that e.g. `/docs/introduction.md` returns raw markdown (and not 404).

---

## 3. Plugin development

### Where plugins live

- Monorepo: `packages/plugin-<name>/` (e.g. `packages/plugin-raw-md/`, `packages/plugin-rss/`).
- Each plugin has `package.json`, `src/`, and builds to `dist/`.

### Plugin API (high level)

- Plugins use `definePlugin<Options>(options => ({ name, hooks, astroIntegration }))` from `@barodoc/core`.
- **Hooks**: `config:loaded`, `content:transform`, `build:start`, `build:done`, etc.
- **astroIntegration**: Astro integration (e.g. `astro:config:setup`, Vite plugins, `configureServer` for dev middleware).

See `AGENTS.md` (Plugin System) and `.cursor/skills/barodoc-plugins/SKILL.md` for details.

### Local workflow

1. **Implement** in `packages/plugin-<name>/src/`.
2. **Build** the plugin and the CLI so the docs site and my-docs use the new code:

   ```bash
   pnpm --filter @barodoc/plugin-<name> build
   pnpm --filter barodoc build
   ```

3. **Test in docs**  
   - Add the plugin to `docs/barodoc.config.json`.  
   - Run `pnpm dev` and verify behavior (e.g. new route, middleware, or build output).

4. **Test in my-docs (quick mode)**  
   - Add the plugin to `my-docs/barodoc.config.json`.  
   - Run from my-docs: `node ../barodoc/packages/barodoc/dist/cli.js serve` and `build . -o dist`.  
   - Confirm both dev and build behave as expected.

5. **Type-check** the whole repo (from barodoc root):

   ```bash
   pnpm --filter docs exec astro sync
   pnpm -r exec tsc --noEmit
   ```

### Releasing a new plugin

1. Add the package to the changeset **linked** array in `.changeset/config.json` if it should version with the rest of the stack.
2. Add a changeset under `.changeset/` (e.g. `feat: add @barodoc/plugin-raw-md`).
3. Merge to `main`; the release workflow will create a “Version packages” PR. Merging that publishes to npm.

---

## Quick reference

| Goal | Command / location |
|------|--------------------|
| ECC + Cursor setup | `./scripts/setup-ecc-cursor.sh` (once) — see [docs/ai-setup.md](docs/ai-setup.md) |
| Dev server (docs) | `pnpm dev` (from barodoc root) |
| Build docs | `pnpm build` |
| Dev server (my-docs) | From my-docs: `node ../barodoc/packages/barodoc/dist/cli.js serve` |
| Build my-docs | From my-docs: `node ../barodoc/packages/barodoc/dist/cli.js build . -o dist` |
| Build all packages | `pnpm build:packages` |
| Type-check | `pnpm --filter docs exec astro sync` then `pnpm -r exec tsc --noEmit` |
| Plugin config (docs) | `docs/barodoc.config.json` → `plugins` |
| Plugin config (my-docs) | `my-docs/barodoc.config.json` → `plugins` |
