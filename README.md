# Barodoc

A Mintlify-style documentation framework built with Astro and MDX.

## Features

- **Zero Config** - Just MD files, no build setup needed
- **MDX Support** - Write documentation in Markdown/MDX with component support
- **Dark Mode** - Built-in dark mode with system preference detection
- **Search** - Full-text search powered by Pagefind
- **i18n** - Multi-language support out of the box
- **Plugins** - Extensible plugin system (sitemap, analytics, etc.)
- **Static** - Deploy anywhere as static files

## Quick Start

```bash
# Create a new project
pnpm create barodoc my-docs

# Navigate to project
cd my-docs

# Start development server (no npm install needed!)
npx barodoc serve

# Build for production
npx barodoc build

# Preview build
npx barodoc preview
```

## Minimal Project Structure

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

That's it! No `package.json`, no `node_modules`, no build configuration.

## CLI Commands

| Command | Description |
|---------|-------------|
| `barodoc serve [dir]` | Start development server |
| `barodoc build [dir]` | Build for production |
| `barodoc preview [dir]` | Preview production build |
| `barodoc create <name>` | Create a new project |

### Options

```bash
# Serve with custom port
barodoc serve --port 3000

# Build to custom directory
barodoc build --output public

# Use custom config file
barodoc serve --config custom.config.json
```

## Configuration

```json
{
  "name": "My Docs",
  "logo": "/logo.svg",
  "theme": {
    "colors": {
      "primary": "#0070f3"
    }
  },
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "ko"]
  },
  "navigation": [
    {
      "group": "Getting Started",
      "group:ko": "시작하기",
      "pages": ["introduction", "quickstart"]
    }
  ],
  "plugins": [
    "@barodoc/plugin-sitemap",
    ["@barodoc/plugin-analytics", { "provider": "google", "id": "G-XXX" }]
  ]
}
```

## Plugins

### Official Plugins

| Plugin | Description |
|--------|-------------|
| `@barodoc/plugin-sitemap` | Generate sitemap.xml |
| `@barodoc/plugin-search` | Pagefind search (built-in) |
| `@barodoc/plugin-analytics` | Google/Plausible/Umami analytics |

### Using Plugins

```json
{
  "plugins": [
    "@barodoc/plugin-sitemap",
    ["@barodoc/plugin-analytics", {
      "provider": "google",
      "id": "G-XXXXXXX"
    }]
  ]
}
```

## Full Custom Mode

For advanced use cases, you can use Barodoc as an Astro integration:

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
      theme: docsTheme(),
    }),
  ],
});
```

## Packages

| Package | Description |
|---------|-------------|
| `barodoc` | Main CLI |
| `@barodoc/core` | Core Astro integration |
| `@barodoc/theme-docs` | Documentation theme |
| `create-barodoc` | Project scaffolding |
| `@barodoc/plugin-*` | Official plugins |

## License

MIT
