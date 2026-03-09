# Barodoc

A documentation framework built with Astro and MDX. Use **Quick mode** (zero-config: just MD files and config) or **Full custom mode** (full Astro project with `@barodoc/core` and `@barodoc/theme-docs`).

**Documentation:** [Guides & API](https://github.com/barocss/barodoc/tree/main/docs)

## Features

- **Zero Config** — Just MD files and optional `barodoc.config.json`; no `package.json` or build setup needed in Quick mode
- **MDX Support** — Write docs in Markdown/MDX with full component support
- **Dark Mode** — Built-in dark mode with system preference detection
- **Search** — Full-text search powered by Pagefind (default)
- **i18n** — Multi-language support out of the box
- **Sections** — Multiple doc sections (e.g. Help, Guides) with independent sidebars
- **Tabs** — Top-level navigation tabs for Docs, Blog, API Reference, Changelog, etc.
- **Blog & Changelog** — Built-in content types with card grid and timeline layouts
- **API Reference** — Auto-generated from OpenAPI specs via plugin, with interactive playground
- **Standalone pages** — About, Pricing, etc. with single-column layout (no sidebar)
- **Overrides** — Override components and layouts without ejecting from Quick mode
- **Plugins** — Extensible plugin system (sitemap, analytics, OpenAPI, RSS, PWA, and more)
- **Static** — Deploy anywhere as static files (Vercel, Netlify, GitHub Pages, Cloudflare Pages)
- **Convenience** — Edit link, last updated timestamp, feedback widget, announcement banner, page contributors from Git

## Quick Start

**Prerequisites:** Node.js 20+, pnpm (recommended)

```bash
# Create a new project
pnpm create barodoc my-docs
# or
barodoc create my-docs

cd my-docs

# Start development server (no npm install needed in Quick mode)
npx barodoc serve

# Build for production
npx barodoc build

# Preview production build
npx barodoc preview
```

When you omit the `[dir]` argument, Barodoc auto-detects the content directory (`docs/`, `content/`, or `src/content/docs/` in that order).

## Project Structure

**Quick mode (minimal):**

```
my-docs/
├── docs/
│   └── en/
│       ├── introduction.md
│       └── quickstart.md
├── public/
│   └── logo.svg
├── barodoc.config.json
└── .gitignore
```

No `package.json`, no `node_modules`, no build configuration.

**Optional directories** (when configured):

- **Sections** — e.g. `help/en/`, `guides/en/` for additional sections with their own sidebars (see `sections` in config)
- **Standalone pages** — `pages/` for About, Pricing, etc. (e.g. `/about`, `/pricing`)
- **Blog** — `blog/` for posts at `/blog/*` (Full custom mode: `src/content/blog/`)
- **Changelog** — `changelog/` for release notes at `/changelog` (Full custom: `src/content/changelog/`)

## CLI Commands

| Command | Description |
|---------|-------------|
| `barodoc serve [dir]` | Start development server with hot reload |
| `barodoc build [dir]` | Build for production |
| `barodoc preview [dir]` | Preview production build locally |
| `barodoc create <name>` | Scaffold a new project |
| `barodoc check [dir]` | Validate navigation, frontmatter, and related links |
| `barodoc manifest [dir]` | Generate `docs-manifest.json` for AI/agent consumption |
| `barodoc init [dir]` | Initialize Barodoc in an existing directory |
| `barodoc eject [dir]` | Eject from Quick mode to a full Astro project |

### Options

| Flag | Command(s) | Description |
|------|------------|-------------|
| `-p, --port <port>` | serve, preview | Port (default: `4321`) |
| `-h, --host` | serve | Expose to network |
| `--open` | serve | Open browser on start |
| `-o, --output <dir>` | build, manifest | Output directory or file (build default: `dist`) |
| `-c, --config <file>` | serve, build, preview, check, manifest | Config file path |
| `--clean` | serve, build | Force reinstall dependencies |
| `--fix` | check | Auto-fix missing/orphan nav entries |

## Configuration

Configure your site via `barodoc.config.json` at the project root:

```json
{
  "name": "My Docs",
  "logo": "/logo.svg",
  "favicon": "/favicon.ico",
  "theme": {
    "colors": {
      "accent": "#2563eb",
      "gray": "zinc"
    },
    "fonts": { "heading": "Inter, sans-serif", "body": "Inter, sans-serif", "code": "JetBrains Mono, monospace" },
    "radius": "0.5rem"
  },
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "ko"],
    "labels": { "en": "English", "ko": "한국어" }
  },
  "tabs": [
    { "label": "Docs", "href": "/docs/introduction" },
    { "label": "Blog", "href": "/blog" },
    { "label": "Changelog", "href": "/changelog" }
  ],
  "sections": [
    { "slug": "help", "label": "Help Center", "navigation": [{ "group": "Support", "pages": ["faq", "contact"] }] }
  ],
  "navigation": [
    { "group": "Getting Started", "group:ko": "시작하기", "pages": ["introduction", "quickstart"] }
  ],
  "topbar": { "github": "https://github.com/user/repo", "discord": "https://discord.gg/...", "twitter": "https://twitter.com/..." },
  "search": { "enabled": true },
  "lineNumbers": true,
  "editLink": { "baseUrl": "https://github.com/user/repo/edit/main/docs/" },
  "lastUpdated": true,
  "announcement": { "text": "v2 is out!", "link": "/changelog", "dismissible": true },
  "feedback": { "enabled": true, "endpoint": "https://api.example.com/feedback" },
  "site": "https://docs.example.com",
  "base": "/",
  "customCss": ["./custom.css"],
  "plugins": [
    "@barodoc/plugin-sitemap",
    ["@barodoc/plugin-analytics", { "provider": "google", "id": "G-XXX" }]
  ]
}
```

See the documentation in the repo's `docs/` folder for all options.

## Content Types

| Type | Directory (Quick / Full custom) | Route |
|------|---------------------------------|-------|
| Docs | `docs/{locale}/` / `src/content/docs/{locale}/` | `/docs/*` |
| Blog | `blog/` / `src/content/blog/` | `/blog/*` |
| Changelog | `changelog/` / `src/content/changelog/` | `/changelog` |
| API Reference | OpenAPI plugin | `/docs/api/*` |
| Standalone pages | `pages/` / `src/content/pages/` | `/about`, `/pricing`, etc. |

## Plugins

### Official Plugins (overview)

| Plugin | Description |
|--------|-------------|
| `@barodoc/plugin-sitemap` | Generate sitemap.xml |
| `@barodoc/plugin-search` | Pagefind full-text search (default) |
| `@barodoc/plugin-analytics` | Google / Plausible / Umami analytics |
| `@barodoc/plugin-openapi` | OpenAPI spec → API docs + interactive playground |
| `@barodoc/plugin-rss` | RSS feed for blog and changelog |
| `@barodoc/plugin-pwa` | PWA support, offline access |
| `@barodoc/plugin-og-image` | Auto-generate Open Graph images for sharing |
| `@barodoc/plugin-llms-txt` | Generate llms.txt for AI-friendly docs |
| `@barodoc/plugin-docsearch` | Algolia DocSearch integration |
| `@barodoc/plugin-raw-md` | Raw Markdown processing (e.g. include frontmatter in output) |

### Plugin usage guides

**Full custom mode:** install the package first (e.g. `pnpm add @barodoc/plugin-sitemap`). **Quick mode:** the CLI resolves plugins from its own dependencies; list them in config only.

---

#### @barodoc/plugin-sitemap

Generates `sitemap.xml` and `sitemap-index.xml` at build time so search engines can discover and index your docs.

1. Set your site URL in config (required for absolute URLs in the sitemap):

```json
{
  "site": "https://docs.example.com",
  "plugins": ["@barodoc/plugin-sitemap"]
}
```

2. Optional: exclude paths or add custom URLs:

```json
{
  "plugins": [
    ["@barodoc/plugin-sitemap", {
      "exclude": ["/404", "/api/*"],
      "customPages": ["https://docs.example.com/changelog"]
    }]
  ]
}
```

---

#### @barodoc/plugin-search

Full-text search with [Pagefind](https://pagefind.app). **Enabled by default.** Search is in the header and via `Ctrl+K` / `Cmd+K`.

To customize (e.g. exclude API pages from the index):

```json
{
  "plugins": [
    ["@barodoc/plugin-search", {
      "enabled": true,
      "pagefind": { "exclude": ["api/*"] }
    }]
  ]
}
```

---

#### @barodoc/plugin-analytics

Injects tracking for Google Analytics, Plausible, or Umami.

**Google Analytics:**

```json
{
  "plugins": [
    ["@barodoc/plugin-analytics", {
      "provider": "google",
      "id": "G-XXXXXXXXXX"
    }]
  ]
}
```

**Plausible:**

```json
{
  "plugins": [
    ["@barodoc/plugin-analytics", {
      "provider": "plausible",
      "domain": "docs.example.com"
    }]
  ]
}
```

**Umami:**

```json
{
  "plugins": [
    ["@barodoc/plugin-analytics", {
      "provider": "umami",
      "websiteId": "your-website-id",
      "src": "https://analytics.example.com/umami.js"
    }]
  ]
}
```

---

#### @barodoc/plugin-openapi

Generates API reference pages from OpenAPI (Swagger) specs: parameter tables, response examples, cURL snippets, and an optional **interactive playground**.

1. Put your spec in the project root (e.g. `openapi.yaml`).

2. Add the plugin and point it at the spec:

```json
{
  "plugins": [
    ["@barodoc/plugin-openapi", {
      "specFile": "openapi.yaml",
      "basePath": "api",
      "groupBy": "tags",
      "baseUrl": "https://api.example.com",
      "playground": true
    }]
  ]
}
```

3. Add the generated pages to `navigation`. Slugs come from your spec’s **tags** (lowercased, hyphenated). Example: tag `User Management` → slug `api/user-management`:

```json
{
  "navigation": [
    { "group": "API Reference", "pages": ["api/users", "api/auth"] }
  ]
}
```

4. Optional: add a header tab, e.g. `{ "label": "API", "href": "/docs/api/users" }`.

**Multiple specs** (e.g. public + admin API): pass an array to `specFile` with `file`, `basePath`, and `baseUrl` per entry. See the docs for the full shape.

---

#### @barodoc/plugin-rss

Generates an RSS feed at `/rss.xml` for blog and/or changelog so users can subscribe.

```json
{
  "plugins": [
    ["@barodoc/plugin-rss", {
      "title": "My Docs Updates",
      "description": "Latest updates from our documentation",
      "collections": ["blog", "changelog"]
    }]
  ]
}
```

- `collections`: `["blog"]` (default), `["changelog"]`, or both.

---

#### @barodoc/plugin-pwa

Adds PWA support: offline caching, install prompt, and a web app manifest. Build outputs `manifest.json` and `sw.js`.

```json
{
  "plugins": [
    ["@barodoc/plugin-pwa", {
      "name": "My Docs",
      "shortName": "Docs",
      "themeColor": "#0070f3",
      "backgroundColor": "#ffffff",
      "display": "standalone"
    }]
  ]
}
```

- `display`: `"standalone"` | `"fullscreen"` | `"minimal-ui"` | `"browser"`.
- Optional: `offlineFallback` — path of the page shown when offline and the requested page isn’t cached (default: `"/404"`).

---

#### @barodoc/plugin-og-image

Generates Open Graph images at build time for each docs page. Shared links on Twitter, Facebook, Slack, etc. show a preview. Images go to `dist/og/` and are wired via `<meta property="og:image">`.

```json
{
  "plugins": [
    ["@barodoc/plugin-og-image", {
      "background": "#ffffff",
      "textColor": "#0f172a",
      "accentColor": "#0070f3"
    }]
  ]
}
```

Optional: `fontPath` (TTF/OTF for text), `width`, `height` (default 1200×630).

---

#### @barodoc/plugin-llms-txt

Generates [llms.txt](https://llmstxt.org) files so AI assistants and LLMs can consume your docs. Outputs `llms.txt` (summary with titles, descriptions, links) and optionally `llms-full.txt` (full page content).

```json
{
  "plugins": [
    ["@barodoc/plugin-llms-txt", {
      "description": "Documentation for My Project",
      "full": true,
      "links": [
        { "title": "GitHub", "url": "https://github.com/user/repo" },
        { "title": "API Reference", "url": "https://docs.example.com/api" }
      ]
    }]
  ]
}
```

- `full: true` — generate `llms-full.txt` (default: `true`).
- `links` — extra links in the header (e.g. repo, API).

---

#### @barodoc/plugin-docsearch

Replaces the default Pagefind search with [Algolia DocSearch](https://docsearch.algolia.com). Apply at [docsearch.algolia.com/apply](https://docsearch.algolia.com/apply); you’ll get `appId`, `apiKey`, and `indexName`.

```json
{
  "plugins": [
    ["@barodoc/plugin-docsearch", {
      "appId": "YOUR_APP_ID",
      "apiKey": "YOUR_SEARCH_API_KEY",
      "indexName": "your_index_name"
    }]
  ]
}
```

When enabled, the default search is replaced by the Algolia modal. Optional: `container` (CSS selector), `placeholder` (search input placeholder).

---

#### @barodoc/plugin-raw-md

Serves **raw Markdown** for each page at a `.md` URL (e.g. `/docs/introduction.md`). Aimed at AI agents and tools that consume plain Markdown. You can strip MDX/component tags and choose whether to include frontmatter.

```json
{
  "plugins": [
    ["@barodoc/plugin-raw-md", {
      "clean": true,
      "includeFrontmatter": true,
      "collections": ["docs", "help"]
    }]
  ]
}
```

- `clean: true` — strip MDX/component tags so output is plain Markdown (default: `true`).
- `includeFrontmatter: true` — include YAML frontmatter in the output (default: `true`).
- `collections` — which content collections get `.md` URLs (e.g. `docs`, `help`). Omit to include all.

---

### Using Plugins

Add plugins in `barodoc.config.json`. Use a string for no options, or `[packageName, options]` for config:

```json
{
  "plugins": [
    "@barodoc/plugin-sitemap",
    ["@barodoc/plugin-analytics", { "provider": "google", "id": "G-XXXXXXX" }],
    ["@barodoc/plugin-openapi", { "specFile": "openapi.yaml", "basePath": "api", "playground": true }]
  ]
}
```

## Overrides

Override theme components and layouts without ejecting: add `overrides/components/` and `overrides/layouts/` in your project. See the documentation in the repo's `docs/` folder for details.

## Full Custom Mode

For full control (custom routes, other Astro integrations), use Barodoc as an Astro integration. Content lives under `src/content/docs/` and you run `pnpm dev` / `pnpm build`.

```bash
pnpm add @barodoc/core @barodoc/theme-docs astro
```

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import barodoc from "@barodoc/core";
import docsTheme from "@barodoc/theme-docs";

export default defineConfig({
  integrations: [
    barodoc({
      config: "./barodoc.config.json",
      theme: docsTheme(),
    }),
  ],
});
```

## Packages

| Package | Description |
|---------|-------------|
| `barodoc` | Main CLI (serve, build, check, manifest, create, init, eject) |
| `@barodoc/core` | Core Astro integration |
| `@barodoc/theme-docs` | Documentation theme and UI components |
| `create-barodoc` | Project scaffolding |
| `@barodoc/plugin-*` | Official plugins (sitemap, search, analytics, openapi, rss, pwa, og-image, llms-txt, docsearch, raw-md) |

## License

MIT
