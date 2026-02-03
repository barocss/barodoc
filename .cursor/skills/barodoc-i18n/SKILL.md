---
name: barodoc-i18n
description: Internationalization (i18n) support in Barodoc. Use when adding multi-language support, configuring locales, creating translated content, or troubleshooting i18n issues.
---

# Barodoc i18n (Internationalization)

Barodoc supports multiple languages through Astro's i18n system with additional configuration.

## Configuration Overview

i18n requires configuration in TWO places:

### 1. barodoc.config.json

```json
{
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "ko", "ja"],
    "labels": {
      "en": "English",
      "ko": "한국어",
      "ja": "日本語"
    }
  }
}
```

### 2. astro.config.mjs (REQUIRED for Full Custom Mode)

```javascript
import { defineConfig } from "astro/config";
import barodoc from "@barodoc/core";
import docsTheme from "@barodoc/theme-docs";

export default defineConfig({
  site: "https://example.com",
  // i18n MUST be set here, not through updateConfig
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ko", "ja"],
    routing: {
      prefixDefaultLocale: false,  // /docs/intro (not /en/docs/intro)
    },
  },
  integrations: [
    barodoc({
      config: "./barodoc.config.json",
      theme: docsTheme(),
    }),
  ],
});
```

**CRITICAL**: Astro 5.x has a bug where setting i18n through `updateConfig()` in integrations causes a `Cannot read properties of undefined (reading 'redirectToDefaultLocale')` error. Always set i18n in `astro.config.mjs` directly.

## Content Directory Structure

**Locale 폴더는 필수입니다.** 단일 언어여도 locale 폴더를 사용해야 합니다.

### Single Language (단일 언어)

한국어만 사용하는 경우:

```json
// barodoc.config.json
{
  "i18n": {
    "defaultLocale": "ko",
    "locales": ["ko"]
  }
}
```

```javascript
// astro.config.mjs
i18n: {
  defaultLocale: "ko",
  locales: ["ko"],
  routing: { prefixDefaultLocale: false }
}
```

```
docs/
└── ko/                    # 필수 - locale 폴더
    ├── introduction.md
    ├── quickstart.md
    └── guides/
        └── installation.md
```

**결과 URL:**
- `docs/ko/introduction.md` → `/docs/introduction` (no `/ko/` prefix)
- `docs/ko/guides/installation.md` → `/docs/guides/installation`

### Multiple Languages (다국어)

```json
// barodoc.config.json
{
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "ko", "ja"]
  }
}
```

```
docs/
├── en/                    # 기본 언어
│   ├── introduction.md
│   └── guides/
│       └── installation.md
├── ko/                    # 한국어
│   ├── introduction.md
│   └── guides/
│       └── installation.md
└── ja/                    # 일본어
    └── ...
```

**결과 URL:**
- `docs/en/introduction.md` → `/docs/introduction` (기본 언어, prefix 없음)
- `docs/ko/introduction.md` → `/ko/docs/introduction`
- `docs/ja/introduction.md` → `/ja/docs/introduction`

### Full Custom Mode

```
src/content/docs/
├── en/
│   ├── introduction.mdx
│   └── ...
├── ko/
│   ├── introduction.mdx
│   └── ...
└── ...
```

### Why Locale Folders Are Required

1. **일관성** - 모든 프로젝트가 동일한 구조
2. **확장성** - 다국어 추가 시 구조 변경 불필요
3. **Astro 컨벤션** - Content Collections 패턴과 일치
4. **명확한 분리** - 언어별 콘텐츠가 명확히 구분됨

## Navigation i18n

Use `group:LOCALE` pattern for localized navigation group names:

```json
{
  "navigation": [
    {
      "group": "Getting Started",
      "group:ko": "시작하기",
      "group:ja": "はじめに",
      "pages": ["introduction", "quickstart"]
    },
    {
      "group": "Guides",
      "group:ko": "가이드",
      "group:ja": "ガイド",
      "pages": ["guides/installation", "guides/configuration"]
    }
  ]
}
```

Page slugs in `pages` array are locale-independent. The system automatically looks for:
- `/en/introduction.md` for English
- `/ko/introduction.md` for Korean
- etc.

## URL Routing

| Locale | URL Pattern | Notes |
|--------|-------------|-------|
| Default (en) | `/docs/intro` | No locale prefix |
| Non-default | `/ko/docs/intro` | Locale prefix added |

With `prefixDefaultLocale: false`:
- English: `https://example.com/docs/intro`
- Korean: `https://example.com/ko/docs/intro`

## i18n Utility Functions

Available from `@barodoc/core`:

```typescript
import {
  getLocaleFromPath,
  removeLocaleFromPath,
  getLocalizedPath,
  getLocalizedNavGroup,
  getLocaleLabel,
  getAllLocalePaths,
} from "@barodoc/core";
```

### getLocaleFromPath

```typescript
getLocaleFromPath("/ko/docs/intro", i18n)  // "ko"
getLocaleFromPath("/docs/intro", i18n)     // "en" (defaultLocale)
```

### getLocalizedPath

```typescript
getLocalizedPath("/docs/intro", "ko", i18n)  // "/ko/docs/intro"
getLocalizedPath("/docs/intro", "en", i18n)  // "/docs/intro"
```

### getLocalizedNavGroup

```typescript
const navItem = {
  group: "Getting Started",
  "group:ko": "시작하기",
  pages: ["intro"]
};

getLocalizedNavGroup(navItem, "ko", "en")  // "시작하기"
getLocalizedNavGroup(navItem, "en", "en")  // "Getting Started"
getLocalizedNavGroup(navItem, "ja", "en")  // "Getting Started" (fallback)
```

### getLocaleLabel

```typescript
// With custom labels
getLocaleLabel("ko", { ko: "한국어" })  // "한국어"

// Built-in defaults
getLocaleLabel("ko")  // "한국어"
getLocaleLabel("en")  // "English"
getLocaleLabel("ja")  // "日本語"
getLocaleLabel("zh")  // "中文"
getLocaleLabel("fr")  // "Français"
getLocaleLabel("de")  // "Deutsch"
getLocaleLabel("es")  // "Español"
```

## Virtual Module Access

In Astro components, access i18n config via virtual modules:

```astro
---
import { i18n, defaultLocale, locales } from "virtual:barodoc/i18n";
import config from "virtual:barodoc/config";

// i18n = { defaultLocale: "en", locales: ["en", "ko"], labels: {...} }
// defaultLocale = "en"
// locales = ["en", "ko"]
---
```

## LanguageSwitcher Component

The theme includes a built-in language switcher in the header:

```astro
---
import { LanguageSwitcher } from "@barodoc/theme-docs/components/LanguageSwitcher.astro";
---

<LanguageSwitcher currentLocale={currentLocale} />
```

Features:
- Dropdown menu with all configured locales
- Shows locale labels from config
- Preserves current path when switching
- Responsive (icon-only on mobile)

## Content Collection Schema

For Full Custom Mode, define the content collection:

```typescript
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const docs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    sidebar_label: z.string().optional(),
  }),
});

export const collections = { docs };
```

## Frontmatter for Translated Content

Each locale's content file should have appropriate frontmatter:

```markdown
---
title: 시작하기
description: Barodoc 문서 시스템을 시작하는 방법
---

# 시작하기

...content in Korean...
```

## Common Issues

### Issue: "Cannot read properties of undefined (reading 'redirectToDefaultLocale')"

**Cause**: i18n set via `updateConfig()` in integration instead of `astro.config.mjs`

**Solution**: Always set i18n directly in `astro.config.mjs`:

```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ko"],
    routing: { prefixDefaultLocale: false },
  },
  // ...
});
```

### Issue: Locale not detected correctly

**Cause**: Path doesn't start with locale code

**Solution**: Ensure content is in locale subdirectories:
- `docs/en/intro.md` (correct)
- `docs/intro.md` (incorrect - no locale)

### Issue: Navigation groups not translating

**Cause**: Missing `group:LOCALE` keys

**Solution**: Add localized group names:

```json
{
  "group": "Getting Started",
  "group:ko": "시작하기"
}
```

## Adding a New Language

1. Add locale to `barodoc.config.json`:

```json
{
  "i18n": {
    "locales": ["en", "ko", "ja"],
    "labels": { "ja": "日本語" }
  }
}
```

2. Add to `astro.config.mjs`:

```javascript
i18n: {
  locales: ["en", "ko", "ja"],
}
```

3. Create content directory: `docs/ja/` or `src/content/docs/ja/`

4. Add translations for navigation groups:

```json
{
  "group": "Getting Started",
  "group:ja": "はじめに"
}
```

5. Create translated content files with matching slugs
