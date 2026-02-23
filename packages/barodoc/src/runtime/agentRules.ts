/**
 * Generates the content for CLAUDE.md — the AI agent rules file for a barodoc project.
 * This file teaches AI assistants (Claude, Cursor, etc.) how to write docs
 * compatible with barodoc's conventions.
 */
export function generateAgentRules(projectName: string): string {
  return `# Barodoc Documentation Rules for AI Agents

This file defines the rules for generating and editing documentation in this project.
It is used by AI assistants (Claude, Cursor, GitHub Copilot, etc.) to produce
markdown files that are fully compatible with barodoc.

## Project: ${projectName}

---

## File Structure

\`\`\`
docs/
  {locale}/              # e.g., en/, ko/, ja/
    {slug}.md            # Markdown or MDX files
    {slug}.mdx
    {category}/{slug}.mdx  # Nested paths (e.g., guides/installation.mdx)

overrides/               # Optional: component/layout overrides
  components/            # Custom or overridden MDX components
  layouts/               # Layout overrides

public/                  # Static assets (images, logo, etc.)
barodoc.config.json      # Site configuration
\`\`\`

- Each page is a single \`.md\` or \`.mdx\` file inside \`docs/{locale}/\`.
- The filename (without extension) becomes the **slug** used in navigation.
- Nested paths are supported: \`docs/en/guides/installation.mdx\` → slug \`guides/installation\`.
- Use \`.mdx\` when you need to include interactive components (Callout, Steps, etc.).
- Use \`.md\` for plain text-only pages.

---

## Frontmatter

Every page **should** include frontmatter at the top:

\`\`\`md
---
title: Page Title
description: A brief description shown in search results and meta tags.
tags: [topic1, topic2]
related: [other-page-slug, guides/related-guide]
category: guides
difficulty: beginner
---
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`title\` | string | Optional. If omitted, the first \`#\` heading is used. |
| \`description\` | string | Recommended. Used for SEO and search result snippets. |
| \`tags\` | string[] | Classification tags for search and AI filtering. |
| \`related\` | string[] | Slugs of related pages. Must be valid slugs in navigation. |
| \`category\` | string | Explicit category. Auto-detected from navigation group if omitted. |
| \`difficulty\` | \`"beginner"\` \| \`"intermediate"\` \| \`"advanced"\` | Content difficulty. |
| \`api_reference\` | boolean | Marks the page as API reference content. |
| \`lastUpdated\` | date | Manual override for last-updated timestamp. |

**Rules for \`related\`:** Only use slugs that exist in \`barodoc.config.json\` navigation. \`barodoc check\` validates these.

---

## Navigation Registration

After creating a new file, register it in \`barodoc.config.json\`:

\`\`\`json
{
  "navigation": [
    {
      "group": "Getting Started",
      "group:ko": "시작하기",
      "pages": ["introduction", "quickstart"]
    },
    {
      "group": "Guides",
      "pages": ["installation", "configuration", "deployment"]
    }
  ]
}
\`\`\`

- \`pages\` contains **slugs only** (filename without extension, without locale prefix).
- \`group:ko\`, \`group:ja\` etc. provide localized group names.
- **Every created file must appear in \`navigation\`** or it won't be reachable.
- Run \`barodoc check\` to detect orphaned files or missing nav entries.
- Run \`barodoc check --fix\` to auto-repair navigation.

---

## MDX Components

When using \`.mdx\` files, these components are available globally (no import needed):

### Callout

\`\`\`mdx
<Callout type="info">This is an informational note.</Callout>

<Callout type="warning" title="Watch out!">
  This action cannot be undone.
</Callout>

<Callout type="tip">Use keyboard shortcuts to save time.</Callout>

<Callout type="danger">This will permanently delete your data.</Callout>

<Callout type="note">Additional context goes here.</Callout>
\`\`\`

Supported types: \`info\` | \`warning\` | \`tip\` | \`danger\` | \`note\`

---

### Steps

Use for sequential step-by-step guides:

\`\`\`mdx
<Steps>
  <Step title="Install dependencies">
    \`\`\`bash
    npm install
    \`\`\`
  </Step>
  <Step title="Configure environment">
    Copy \`.env.example\` to \`.env\` and fill in the values.
  </Step>
  <Step title="Run the server">
    \`\`\`bash
    npm run dev
    \`\`\`
  </Step>
</Steps>
\`\`\`

---

### Card and CardGroup

Use to display a grid of linked cards:

\`\`\`mdx
<CardGroup cols={2}>
  <Card title="Quickstart" href="/quickstart">
    Get up and running in minutes.
  </Card>
  <Card title="API Reference" href="/api-reference">
    Explore the full API documentation.
  </Card>
</CardGroup>
\`\`\`

- \`cols\` accepts \`1\`, \`2\`, or \`3\`.
- \`href\` is optional — cards can be informational without a link.

---

### CodeGroup

Display multiple code examples with tabs:

\`\`\`mdx
<CodeGroup>
\`\`\`bash npm
npm install @barodoc/core
\`\`\`

\`\`\`bash pnpm
pnpm add @barodoc/core
\`\`\`

\`\`\`bash yarn
yarn add @barodoc/core
\`\`\`
</CodeGroup>
\`\`\`

The text after the language name becomes the tab label.

---

## i18n (Internationalization)

If the project has multiple locales:

- Create parallel files: \`docs/en/page.md\` and \`docs/ko/page.md\`.
- Slugs must match across locales.
- Navigation uses the same slug for all locales — only group names can be localized.

\`\`\`json
{
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "ko"],
    "labels": { "en": "English", "ko": "한국어" }
  }
}
\`\`\`

---

## Workflow for Adding a New Page

1. Create \`docs/{locale}/{slug}.md\` (or \`.mdx\` for components).
2. Add frontmatter with \`title\` and \`description\`.
3. Write content using standard markdown + MDX components if needed.
4. Register the slug in \`barodoc.config.json\` under the appropriate navigation group.
5. Run \`barodoc check\` to verify everything is correct.
6. Run \`barodoc serve\` to preview in the browser.

---

## Content Guidelines

- Use \`##\` for top-level sections within a page (the page \`#\` title is auto-rendered).
- Keep descriptions concise (1–2 sentences for \`description\` frontmatter).
- **Always include a language identifier on fenced code blocks** (e.g., \\\`\\\`\\\`bash, \\\`\\\`\\\`json, \\\`\\\`\\\`typescript). This is required for syntax highlighting and AI code classification.
- Prefer \`<Callout type="warning">\` over bold text for important notices.
- Use \`<Steps>\` for any multi-step process (installation, setup, etc.).
- Images go in \`public/\` and are referenced as \`/image.png\`.
- When referencing other doc pages, use the slug (e.g., \`guides/configuration\`), not file paths.

---

## Overrides (Custom Components)

Place custom components in \`overrides/components/\` to extend or replace theme components:

\`\`\`
overrides/
  components/
    CustomBanner.tsx      # New component
    Callout.tsx           # Overrides built-in Callout
\`\`\`

Import in MDX via the alias:

\`\`\`mdx
import CustomBanner from "@overrides/components/CustomBanner";

<CustomBanner text="Hello" />
\`\`\`

---

## CLI Commands

\`\`\`bash
# Check for issues (missing files, orphan pages, frontmatter, invalid related links)
barodoc check

# Auto-fix navigation mismatches
barodoc check --fix

# Generate docs-manifest.json (structured metadata + content for AI agents)
barodoc manifest

# Generate RAG-optimized chunks
barodoc manifest --chunks

# Generate JSON Schema for config and frontmatter
barodoc schema

# Start dev server
barodoc serve

# Production build
barodoc build
\`\`\`
`;
}
