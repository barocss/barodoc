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
 * Convert markdown to plain text (minimal conversion for llms.txt)
 */
function markdownToPlainText(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")       // Remove heading markers
    .replace(/\*\*(.+?)\*\*/g, "$1")    // Bold
    .replace(/\*(.+?)\*/g, "$1")        // Italic
    .replace(/`{3}[\s\S]*?`{3}/g, "")  // Code blocks
    .replace(/`(.+?)`/g, "$1")          // Inline code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Links
    .replace(/^[-*+]\s+/gm, "- ")       // List items
    .replace(/^\s*>\s+/gm, "")          // Blockquotes
    .replace(/\n{3,}/g, "\n\n")         // Excess newlines
    .trim();
}

/**
 * Scan docs directory and collect page entries
 */
function scanDocs(
  docsDir: string,
  locales: string[],
  defaultLocale: string,
  navigation: Array<{ pages: string[] }>
): PageEntry[] {
  const pages: PageEntry[] = [];

  // Collect slugs in nav order (default locale)
  const orderedSlugs: string[] = [];
  for (const group of navigation) {
    for (const slug of group.pages ?? []) {
      if (!orderedSlugs.includes(slug)) {
        orderedSlugs.push(slug);
      }
    }
  }

  for (const locale of locales) {
    const localeDir = path.join(docsDir, locale);
    if (!fs.existsSync(localeDir)) continue;

    for (const slug of orderedSlugs) {
      let filePath = path.join(localeDir, `${slug}.mdx`);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(localeDir, `${slug}.md`);
      }
      if (!fs.existsSync(filePath)) continue;

      const raw = fs.readFileSync(filePath, "utf-8");
      const title = extractTitle(raw) || slug;
      const description = extractFrontmatterField(raw, "description");
      const body = stripFrontmatter(raw);

      pages.push({ slug, locale, title, description, content: body });
    }

    // Also pick up any files not in navigation
    if (fs.existsSync(localeDir)) {
      const files = fs.readdirSync(localeDir);
      for (const file of files) {
        if (!file.match(/\.(md|mdx)$/)) continue;
        const slug = file.replace(/\.(mdx?)$/, "");
        if (orderedSlugs.includes(slug)) continue; // already handled

        const filePath = path.join(localeDir, file);
        const raw = fs.readFileSync(filePath, "utf-8");
        const title = extractTitle(raw) || slug;
        const description = extractFrontmatterField(raw, "description");
        const body = stripFrontmatter(raw);

        pages.push({ slug, locale, title, description, content: body });
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
    lines.push(markdownToPlainText(page.content));
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

        const docsDir = path.join(root, "docs");
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
