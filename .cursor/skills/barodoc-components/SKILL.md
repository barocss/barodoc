---
name: barodoc-components
description: Barodoc UI components for documentation. Use when adding callouts, cards, tabs, steps, code blocks, or API documentation components to MDX files.
---

# Barodoc Components

Components available in `@barodoc/theme-docs` for building documentation.

## Import in MDX

```mdx
import { Callout, Card, CardGroup, Tabs, Tab, Steps, Step } from "@barodoc/theme-docs/components/mdx";
import { ApiEndpoint, ApiParams, ApiParam, ApiResponse } from "@barodoc/theme-docs/components/api";
```

## MDX Components

### Callout

Highlighted information boxes with different types.

```mdx
<Callout type="info" title="Note">
  This is an informational callout.
</Callout>

<Callout type="warning" title="Caution">
  Be careful with this operation.
</Callout>

<Callout type="tip" title="Pro Tip">
  Here's a helpful suggestion.
</Callout>

<Callout type="danger" title="Warning">
  This action cannot be undone.
</Callout>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"info" \| "warning" \| "tip" \| "danger"` | `"info"` | Callout style |
| `title` | string | Type name | Custom title |

**Styles:**

| Type | Background | Icon |
|------|------------|------|
| info | Blue | Info circle |
| warning | Yellow | Warning triangle |
| tip | Green | Lightbulb |
| danger | Red | Alert circle |

### Card

Clickable card with title and description.

```mdx
<Card title="Getting Started" icon="🚀" href="/docs/quickstart">
  Learn how to set up your first documentation site.
</Card>

<Card title="Configuration" icon="⚙️">
  Configure your site settings and navigation.
</Card>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Card title |
| `icon` | string | No | Emoji or icon |
| `href` | string | No | Link URL (makes card clickable) |

### CardGroup

Grid layout for multiple cards.

```mdx
<CardGroup cols={2}>
  <Card title="Installation" href="/docs/install">
    Install Barodoc in your project.
  </Card>
  <Card title="Configuration" href="/docs/config">
    Configure your documentation site.
  </Card>
</CardGroup>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | number | 2 | Number of columns |

### Tabs

Tabbed content sections.

```mdx
<Tabs items={[
  { label: "npm", value: "npm", children: <code>npm install barodoc</code> },
  { label: "pnpm", value: "pnpm", children: <code>pnpm add barodoc</code> },
  { label: "yarn", value: "yarn", children: <code>yarn add barodoc</code> },
]} defaultValue="pnpm" />
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | TabItem[] | Yes | Tab items |
| `defaultValue` | string | No | Initially active tab |

**TabItem:**

```typescript
interface TabItem {
  label: string;    // Tab button text
  value: string;    // Unique identifier
  children: ReactNode;  // Tab content
}
```

### Steps

Numbered step-by-step guide.

```mdx
<Steps>
  <Step title="Install dependencies">
    Run `npm install` to install all required packages.
  </Step>
  <Step title="Configure settings">
    Create `barodoc.config.json` with your site settings.
  </Step>
  <Step title="Start development">
    Run `barodoc serve` to start the development server.
  </Step>
</Steps>
```

**Step Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Step title |

### CodeGroup

Group multiple code blocks with tabs.

```mdx
<CodeGroup>
```javascript title="JavaScript"
const config = require('./config');
```

```typescript title="TypeScript"
import config from './config';
```
</CodeGroup>
```

## API Components

### ApiEndpoint

Display API endpoint information.

```mdx
<ApiEndpoint method="GET" path="/api/users/{id}" description="Retrieve a user by ID">
  Returns a single user object.
</ApiEndpoint>

<ApiEndpoint method="POST" path="/api/users" description="Create a new user">
  Creates a user and returns the created object.
</ApiEndpoint>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `method` | `"GET" \| "POST" \| "PUT" \| "PATCH" \| "DELETE"` | Yes | HTTP method |
| `path` | string | Yes | Endpoint path |
| `description` | string | No | Endpoint description |

**Method Colors:**

| Method | Color |
|--------|-------|
| GET | Green |
| POST | Blue |
| PUT | Yellow |
| PATCH | Orange |
| DELETE | Red |

### ApiParams

Container for API parameters.

```mdx
<ApiParams>
  <ApiParam name="id" type="string" required>
    User ID
  </ApiParam>
  <ApiParam name="email" type="string" required>
    User email address
  </ApiParam>
  <ApiParam name="name" type="string">
    Display name (optional)
  </ApiParam>
</ApiParams>
```

### ApiParam

Individual parameter documentation.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Parameter name |
| `type` | string | Yes | Data type |
| `required` | boolean | No | If required |

### ApiResponse

Document API responses.

```mdx
<ApiResponse status={200}>
```json
{
  "id": "usr_123",
  "email": "user@example.com",
  "name": "John Doe"
}
```
</ApiResponse>

<ApiResponse status={404}>
```json
{
  "error": "User not found"
}
```
</ApiResponse>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `status` | number | Yes | HTTP status code |

## Interactive Components

### ThemeToggle

Dark/light mode toggle (included in header).

```tsx
import { ThemeToggle } from "@barodoc/theme-docs";

<ThemeToggle />
```

### Search

Search component (included in header when enabled).

```tsx
import { Search } from "@barodoc/theme-docs";

<Search />
```

Uses Pagefind for client-side search.

## Layout Components

### BaseLayout

Base HTML layout with theme support.

```astro
---
import { BaseLayout } from "@barodoc/theme-docs/layouts/BaseLayout.astro";
---

<BaseLayout title="Page Title" description="Page description">
  <main>Content</main>
</BaseLayout>
```

### DocsLayout

Full documentation layout with sidebar, header, and TOC.

```astro
---
import { DocsLayout } from "@barodoc/theme-docs/layouts/DocsLayout.astro";
---

<DocsLayout
  title="Getting Started"
  description="Learn how to get started"
  headings={headings}
>
  <Content />
</DocsLayout>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Page title |
| `description` | string | Meta description |
| `headings` | array | Heading list for TOC |

## Complete Example

```mdx
---
title: API Reference
description: Complete API documentation
---

import { Callout, Card, CardGroup, Steps, Step } from "@barodoc/theme-docs/components/mdx";
import { ApiEndpoint, ApiParams, ApiParam, ApiResponse } from "@barodoc/theme-docs/components/api";

# API Reference

<Callout type="info">
  All API endpoints require authentication.
</Callout>

## Authentication

<ApiEndpoint method="POST" path="/api/auth/login" description="Authenticate user">
  <ApiParams>
    <ApiParam name="email" type="string" required>
      User email
    </ApiParam>
    <ApiParam name="password" type="string" required>
      User password
    </ApiParam>
  </ApiParams>

  <ApiResponse status={200}>
    ```json
    { "token": "eyJhbGc..." }
    ```
  </ApiResponse>
</ApiEndpoint>

## Quick Start

<Steps>
  <Step title="Get API Key">
    Sign up at the dashboard to get your API key.
  </Step>
  <Step title="Install SDK">
    Install our SDK using your package manager.
  </Step>
  <Step title="Make First Request">
    Use the code samples below to make your first API call.
  </Step>
</Steps>

## Related Resources

<CardGroup cols={2}>
  <Card title="SDK Reference" icon="📚" href="/docs/sdk">
    Full SDK documentation
  </Card>
  <Card title="Examples" icon="💡" href="/docs/examples">
    Code examples and tutorials
  </Card>
</CardGroup>
```
