---
name: barodoc-plugins
description: Barodoc plugin system for extending functionality. Use when creating plugins, adding analytics, sitemaps, or other extensions to Barodoc documentation sites.
---

# Barodoc Plugin System

Plugins extend Barodoc functionality through hooks and Astro integrations.

## Using Plugins

### Configuration

Add plugins to `barodoc.config.json`:

```json
{
  "plugins": [
    "@barodoc/plugin-sitemap",
    ["@barodoc/plugin-analytics", { "provider": "google", "id": "G-XXXXXXXX" }]
  ]
}
```

Two formats:
- **String**: Plugin name (no options)
- **Tuple**: `[name, options]` for plugins with configuration

## Built-in Plugins

### @barodoc/plugin-sitemap

Generates sitemap.xml for SEO.

```json
{
  "plugins": [
    ["@barodoc/plugin-sitemap", {
      "exclude": ["/api/internal/*"],
      "customPages": ["https://example.com/external-page"]
    }]
  ]
}
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `exclude` | string[] | URL patterns to exclude |
| `customPages` | string[] | Additional URLs to include |

### @barodoc/plugin-search

Configures Pagefind search.

```json
{
  "plugins": ["@barodoc/plugin-search"]
}
```

Search is enabled by default when `search.enabled: true` in config.

### @barodoc/plugin-analytics

Adds analytics tracking scripts.

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

**Supported Providers:**

#### Google Analytics

```json
{
  "provider": "google",
  "id": "G-XXXXXXXXXX"
}
```

#### Plausible

```json
{
  "provider": "plausible",
  "domain": "example.com",
  "src": "https://plausible.io/js/script.js"
}
```

#### Umami

```json
{
  "provider": "umami",
  "websiteId": "your-website-id",
  "src": "https://analytics.example.com/script.js"
}
```

## Creating Custom Plugins

### Basic Structure

```typescript
import { definePlugin } from "@barodoc/core";

export default definePlugin(() => ({
  name: "my-plugin",

  hooks: {
    "config:loaded": (config, context) => {
      console.log("Config loaded:", config.name);
      return config;
    },
  },
}));
```

### With Options

```typescript
import { definePlugin } from "@barodoc/core";

interface MyPluginOptions {
  apiKey: string;
  debug?: boolean;
}

export default definePlugin<MyPluginOptions>((options) => ({
  name: "my-plugin",

  hooks: {
    "build:start": (context) => {
      if (options.debug) {
        console.log("Starting build with API key:", options.apiKey);
      }
    },
  },
}));
```

### Plugin Interface

```typescript
interface BarodocPlugin {
  name: string;
  hooks?: BarodocPluginHooks;
  astroIntegration?: (context: PluginContext) => AstroIntegration;
}
```

## Plugin Hooks

### config:loaded

Called after configuration is loaded. Can modify config.

```typescript
hooks: {
  "config:loaded": (config, context) => {
    // Modify config
    config.search = { enabled: true };
    return config;
  },
}
```

**Parameters:**
- `config`: ResolvedBarodocConfig - Current configuration
- `context`: PluginContext - { config, root, mode }

**Returns:** Modified config or Promise<config>

### content:transform

Called for each content file. Can transform content.

```typescript
hooks: {
  "content:transform": (context) => {
    // Add timestamp to all pages
    context.frontmatter.lastUpdated = new Date().toISOString();
    return context;
  },
}
```

**Parameters:**
- `context.filePath`: string - File path
- `context.content`: string - File content
- `context.frontmatter`: object - Parsed frontmatter

**Returns:** Modified context or Promise<context>

### build:start

Called before build starts.

```typescript
hooks: {
  "build:start": (context) => {
    console.log(`Building in ${context.mode} mode`);
  },
}
```

### build:done

Called after build completes.

```typescript
hooks: {
  "build:done": (buildContext, context) => {
    console.log(`Built ${buildContext.pages.length} pages to ${buildContext.outDir}`);
  },
}
```

**Parameters:**
- `buildContext.outDir`: string - Output directory
- `buildContext.pages`: string[] - Generated page paths

## Astro Integration

Add custom Astro integration:

```typescript
import { definePlugin } from "@barodoc/core";

export default definePlugin(() => ({
  name: "my-astro-plugin",

  astroIntegration: (context) => ({
    name: "my-astro-integration",
    hooks: {
      "astro:config:setup": ({ injectScript, injectRoute }) => {
        // Inject script into head
        injectScript("head-inline", `console.log("Hello from plugin");`);

        // Inject custom route
        injectRoute({
          pattern: "/custom-page",
          entrypoint: "./src/pages/custom.astro",
        });
      },

      "astro:build:done": ({ dir }) => {
        console.log("Build completed:", dir);
      },
    },
  }),
}));
```

## Plugin Context

```typescript
interface PluginContext {
  config: ResolvedBarodocConfig;  // Barodoc config
  root: string;                    // Project root path
  mode: "development" | "production";
}
```

## Example: RSS Feed Plugin

```typescript
import { definePlugin } from "@barodoc/core";
import rss from "@astrojs/rss";

interface RssPluginOptions {
  title: string;
  description: string;
}

export default definePlugin<RssPluginOptions>((options) => ({
  name: "@barodoc/plugin-rss",

  astroIntegration: (context) => ({
    name: "rss-integration",
    hooks: {
      "astro:config:setup": ({ injectRoute }) => {
        injectRoute({
          pattern: "/rss.xml",
          entrypoint: "./src/pages/rss.xml.ts",
        });
      },
    },
  }),

  hooks: {
    "build:done": async (buildContext, context) => {
      console.log(`RSS feed generated for ${context.config.name}`);
    },
  },
}));
```

## Publishing Plugins

1. Create package with `definePlugin` export
2. Name convention: `@barodoc/plugin-*` or `barodoc-plugin-*`
3. Add peer dependency on `@barodoc/core`

```json
{
  "name": "@barodoc/plugin-my-feature",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "peerDependencies": {
    "@barodoc/core": "^1.0.0"
  }
}
```
