import fs from "node:fs";
import path from "node:path";
import { definePlugin } from "@barodoc/core";

export interface LlmsTxtPluginOptions {
  /**
   * Custom site description for the llms.txt header.
   * Defaults to the site name from config.
   */
  description?: string;

  /**
   * Whether to generate llms-full.txt with complete page content.
   * Defaults to true.
   */
  full?: boolean;

  /**
   * Additional links to include in llms.txt
   * e.g. GitHub repo, API reference, etc.
   */
  links?: Array<{ title: string; url: string; description?: string }>;
}

interface PageEntry {
  slug: string;
  locale: string;
  title: string;
  description: string;
  content: string;
}

/**
 * Strip YAML frontmatter from markdown content
 */
function stripFrontmatter(content: string): string {
  if (!content.startsWith("---")) return content;
  const end = content.indexOf("---", 3);
  if (end === -1) return content;
  return content.slice(end + 3).trimStart();
}

/**
 * Extract frontmatter field value
 */
function extractFrontmatterField(content: string, field: string): string {
  if (!content.startsWith("---")) return "";
  const end = content.indexOf("---", 3);
  if (end === -1) return "";
  const fm = content.slice(3, end);
  const match = fm.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
}

/**
 * Extract title from frontmatter or first # heading
 */
function extractTitle(content: string): string {
  const fmTitle = extractFrontmatterField(content, "title");
  if (fmTitle) return fmTitle;

  const body = stripFrontmatter(content);
  const headingMatch = body.match(/^#\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : "";
}

/**
 * Clean markdown for AI consumption.
 * Preserves code blocks (critical for AI agents). Strips MDX component tags.
 */
function cleanMarkdownForAI(md: string): string {
  const codeBlocks: string[] = [];
  let cleaned = md.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  cleaned = cleaned
    .replace(/<\/?(?:Callout|Steps|Step|Card|CardGroup|CodeGroup|CodeItem|ParamField|ParamFieldGroup|Tabs|Tab|Accordion|AccordionItem|Badge|Columns|Column|Expandable|Frame|FileTree|Tooltip|ResponseField|ApiReference|ApiEndpoint|ApiParams|ApiParam|ApiResponse|SimpleAccordion)[^>]*>/g, "")
    .replace(/import\s+.*?from\s+["'].*?["'];?\s*\n?/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "- ")
    .replace(/^\s*>\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n");

  for (let i = 0; i < codeBlocks.length; i++) {
    cleaned = cleaned.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
  }

  return cleaned.trim();
}

/**
 * Recursively find all .md/.mdx files under a directory, returning paths
 * relative to the base.
 */
function walkMdFiles(dir: string, base: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMdFiles(full, base));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      results.push(path.relative(base, full));
    }
  }
  return results;
}

/**
 * Scan docs directory and collect page entries.
 * Handles both locale-based (docs/en/slug.md) and flat (docs/slug.md) layouts.
 */
function scanDocs(
  docsDir: string,
  locales: string[],
  defaultLocale: string,
  navigation: Array<{ pages: string[] }>
): PageEntry[] {
  const orderedSlugs: string[] = [];
  for (const group of navigation) {
    for (const slug of group.pages ?? []) {
      if (!orderedSlugs.includes(slug)) {
        orderedSlugs.push(slug);
      }
    }
  }

  const seen = new Set<string>();
  const pages: PageEntry[] = [];

  function tryReadPage(slug: string, locale: string): boolean {
    const key = `${locale}:${slug}`;
    if (seen.has(key)) return false;

    for (const ext of [".mdx", ".md"]) {
      const locPath = path.join(docsDir, locale, `${slug}${ext}`);
      if (fs.existsSync(locPath)) {
        const raw = fs.readFileSync(locPath, "utf-8");
        pages.push({
          slug, locale,
          title: extractTitle(raw) || slug,
          description: extractFrontmatterField(raw, "description"),
          content: stripFrontmatter(raw),
        });
        seen.add(key);
        return true;
      }

      const flatPath = path.join(docsDir, `${slug}${ext}`);
      if (fs.existsSync(flatPath)) {
        const raw = fs.readFileSync(flatPath, "utf-8");
        pages.push({
          slug, locale,
          title: extractTitle(raw) || slug,
          description: extractFrontmatterField(raw, "description"),
          content: stripFrontmatter(raw),
        });
        seen.add(key);
        return true;
      }
    }
    return false;
  }

  for (const slug of orderedSlugs) {
    tryReadPage(slug, defaultLocale);
  }

  const allFiles = walkMdFiles(docsDir);
  for (const relPath of allFiles) {
    const slug = relPath.replace(/\.(mdx?)$/, "").replace(/\\/g, "/");
    const parts = slug.split("/");

    if (locales.includes(parts[0])) {
      const locale = parts[0];
      const innerSlug = parts.slice(1).join("/");
      if (!seen.has(`${locale}:${innerSlug}`)) {
        tryReadPage(innerSlug, locale);
      }
    } else {
      if (!seen.has(`${defaultLocale}:${slug}`)) {
        tryReadPage(slug, defaultLocale);
      }
    }
  }

  return pages;
}

/**
 * Build llms.txt content (summary format per llmstxt.org spec)
 */
function buildLlmsTxt(
  siteName: string,
  siteUrl: string,
  description: string,
  pages: PageEntry[],
  defaultLocale: string,
  extraLinks: LlmsTxtPluginOptions["links"]
): string {
  const lines: string[] = [];

  lines.push(`# ${siteName}`);
  lines.push("");
  if (description) {
    lines.push(`> ${description}`);
    lines.push("");
  }

  // Default locale pages as the primary listing
  const defaultPages = pages.filter((p) => p.locale === defaultLocale);

  lines.push("## Documentation");
  lines.push("");
  for (const page of defaultPages) {
    const url = siteUrl
      ? `${siteUrl.replace(/\/$/, "")}/${page.slug}`
      : `/${page.slug}`;
    const desc = page.description ? `: ${page.description}` : "";
    lines.push(`- [${page.title}](${url})${desc}`);
  }
  lines.push("");

  if (extraLinks && extraLinks.length > 0) {
    lines.push("## Links");
    lines.push("");
    for (const link of extraLinks) {
      const desc = link.description ? `: ${link.description}` : "";
      lines.push(`- [${link.title}](${link.url})${desc}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Build llms-full.txt content (full page content)
 */
function buildLlmsFullTxt(
  siteName: string,
  pages: PageEntry[],
  defaultLocale: string
): string {
  const lines: string[] = [];

  lines.push(`# ${siteName} — Full Documentation`);
  lines.push("");
  lines.push(
    `This file contains the complete documentation content for AI consumption.`
  );
  lines.push("");
  lines.push("---");
  lines.push("");

  const defaultPages = pages.filter((p) => p.locale === defaultLocale);

  for (const page of defaultPages) {
    lines.push(`# ${page.title}`);
    if (page.description) {
      lines.push("");
      lines.push(`_${page.description}_`);
    }
    lines.push("");
    lines.push(cleanMarkdownForAI(page.content));
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export default definePlugin<LlmsTxtPluginOptions>((options = {}) => {
  const { description, full = true, links } = options;

  return {
    name: "@barodoc/plugin-llms-txt",

    hooks: {
      "build:done": async (buildContext, context) => {
        const { outDir } = buildContext;
        const { config, root } = context;

        const siteName = config.name ?? "Documentation";
        const siteUrl = (config as any).site ?? "";
        const siteDescription = description ?? "";
        const defaultLocale = (config as any).i18n?.defaultLocale ?? "en";
        const locales: string[] = (config as any).i18n?.locales ?? ["en"];
        const navigation = (config as any).navigation ?? [];

        const customModeDir = path.join(root, "src", "content", "docs");
        const docsDir = fs.existsSync(customModeDir) ? customModeDir : path.join(root, "docs");
        const pages = scanDocs(docsDir, locales, defaultLocale, navigation);

        if (pages.length === 0) {
          console.log(
            "[@barodoc/plugin-llms-txt] No pages found, skipping llms.txt generation."
          );
          return;
        }

        // Write llms.txt
        const llmsTxt = buildLlmsTxt(
          siteName,
          siteUrl,
          siteDescription,
          pages,
          defaultLocale,
          links
        );
        fs.writeFileSync(path.join(outDir, "llms.txt"), llmsTxt, "utf-8");
        console.log("[@barodoc/plugin-llms-txt] Generated llms.txt");

        // Write llms-full.txt
        if (full) {
          const llmsFullTxt = buildLlmsFullTxt(siteName, pages, defaultLocale);
          fs.writeFileSync(
            path.join(outDir, "llms-full.txt"),
            llmsFullTxt,
            "utf-8"
          );
          console.log("[@barodoc/plugin-llms-txt] Generated llms-full.txt");
        }
      },
    },
  };
});
