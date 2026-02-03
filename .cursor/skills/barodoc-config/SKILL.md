---
name: barodoc-config
description: Barodoc configuration schema and options. Use when configuring barodoc.config.json, setting up themes, navigation, or customizing site settings.
---

# Barodoc Configuration

Configuration is defined in `barodoc.config.json` at the project root.

## Full Schema

```json
{
  "name": "My Docs",
  "logo": "/logo.svg",
  "favicon": "/favicon.ico",
  "theme": {
    "colors": {
      "primary": "#0070f3",
      "background": "#ffffff",
      "backgroundDark": "#0a0a0a",
      "text": "#171717",
      "textDark": "#ededed",
      "border": "#e5e5e5",
      "borderDark": "#262626"
    },
    "fonts": {
      "heading": "Inter, sans-serif",
      "body": "Inter, sans-serif",
      "code": "Fira Code, monospace"
    },
    "radius": "0.5rem"
  },
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "ko"],
    "labels": {
      "en": "English",
      "ko": "한국어"
    }
  },
  "navigation": [
    {
      "group": "Getting Started",
      "group:ko": "시작하기",
      "pages": ["introduction", "quickstart"]
    }
  ],
  "topbar": {
    "github": "https://github.com/org/repo",
    "discord": "https://discord.gg/invite",
    "twitter": "https://twitter.com/handle"
  },
  "search": {
    "enabled": true
  },
  "plugins": [
    "@barodoc/plugin-sitemap",
    ["@barodoc/plugin-analytics", { "google": "G-XXXXXXXX" }]
  ],
  "customCss": ["./src/styles/custom.css"]
}
```

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Site name (shown in header) |
| `navigation` | array | Sidebar navigation structure |

## Optional Fields

### logo

```json
{
  "logo": "/logo.svg"
}
```

Path to logo image in `public/` directory. Shown in header.

### favicon

```json
{
  "favicon": "/favicon.ico"
}
```

Path to favicon in `public/` directory.

### theme

Customize colors, fonts, and border radius.

#### theme.colors

```json
{
  "theme": {
    "colors": {
      "primary": "#0070f3",
      "background": "#ffffff",
      "backgroundDark": "#0a0a0a",
      "text": "#171717",
      "textDark": "#ededed",
      "border": "#e5e5e5",
      "borderDark": "#262626"
    }
  }
}
```

| Color | Description | Default Light | Default Dark |
|-------|-------------|---------------|--------------|
| `primary` | Accent color | #0070f3 | - |
| `background` | Page background | #ffffff | - |
| `backgroundDark` | Dark mode background | - | #0a0a0a |
| `text` | Text color | #171717 | - |
| `textDark` | Dark mode text | - | #ededed |
| `border` | Border color | #e5e5e5 | - |
| `borderDark` | Dark mode border | - | #262626 |

#### theme.fonts

```json
{
  "theme": {
    "fonts": {
      "heading": "Inter, sans-serif",
      "body": "Inter, sans-serif",
      "code": "Fira Code, monospace"
    }
  }
}
```

#### theme.radius

```json
{
  "theme": {
    "radius": "0.5rem"
  }
}
```

Border radius for UI elements (buttons, cards, etc.).

### i18n

See [barodoc-i18n skill](../barodoc-i18n/SKILL.md) for detailed documentation.

```json
{
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "ko"],
    "labels": {
      "en": "English",
      "ko": "한국어"
    }
  }
}
```

### navigation

Defines sidebar structure:

```json
{
  "navigation": [
    {
      "group": "Getting Started",
      "group:ko": "시작하기",
      "pages": ["introduction", "quickstart"]
    },
    {
      "group": "Guides",
      "group:ko": "가이드",
      "pages": [
        "guides/installation",
        "guides/configuration",
        "guides/deployment"
      ]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `group` | string | Group name (default locale) |
| `group:LOCALE` | string | Localized group name |
| `pages` | string[] | Page slugs (without locale prefix) |

Page slugs map to files:
- `introduction` → `docs/en/introduction.md`
- `guides/installation` → `docs/en/guides/installation.md`

### topbar

Social links in the header:

```json
{
  "topbar": {
    "github": "https://github.com/org/repo",
    "discord": "https://discord.gg/invite",
    "twitter": "https://twitter.com/handle"
  }
}
```

All fields optional. Only configured links are shown.

### search

```json
{
  "search": {
    "enabled": true
  }
}
```

Enables Pagefind search. Index is generated during build.

### plugins

```json
{
  "plugins": [
    "@barodoc/plugin-sitemap",
    ["@barodoc/plugin-analytics", { "google": "G-XXXXXXXX" }]
  ]
}
```

Two formats:
- String: `"plugin-name"` (no options)
- Tuple: `["plugin-name", { options }]`

### customCss

```json
{
  "customCss": ["./src/styles/custom.css"]
}
```

Additional CSS files to include.

## Accessing Config at Runtime

### In Astro Components

```astro
---
import config from "virtual:barodoc/config";

const siteName = config.name;
const primaryColor = config.theme?.colors?.primary;
---
```

### In TypeScript

```typescript
import { loadConfig } from "@barodoc/core/config";

const config = await loadConfig("./barodoc.config.json", process.cwd());
```

## Validation

Config is validated with Zod schema at runtime. Invalid configs throw descriptive errors:

```
Error: Invalid configuration
  - navigation[0].pages: Expected array, received string
```

## Minimal Config Example

```json
{
  "name": "My Docs",
  "navigation": [
    {
      "group": "Documentation",
      "pages": ["index"]
    }
  ]
}
```

## Full Example

```json
{
  "name": "Acme Docs",
  "logo": "/logo.svg",
  "favicon": "/favicon.ico",
  "theme": {
    "colors": {
      "primary": "#6366f1"
    }
  },
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "ko", "ja"],
    "labels": {
      "en": "English",
      "ko": "한국어",
      "ja": "日本語"
    }
  },
  "navigation": [
    {
      "group": "Getting Started",
      "group:ko": "시작하기",
      "group:ja": "はじめに",
      "pages": ["introduction", "quickstart"]
    },
    {
      "group": "API Reference",
      "group:ko": "API 레퍼런스",
      "group:ja": "APIリファレンス",
      "pages": ["api/authentication", "api/endpoints"]
    }
  ],
  "topbar": {
    "github": "https://github.com/acme/docs"
  },
  "search": {
    "enabled": true
  },
  "plugins": [
    "@barodoc/plugin-sitemap"
  ]
}
```
