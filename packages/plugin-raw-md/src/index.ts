import fs from "node:fs";
import path from "node:path";
import { definePlugin } from "@barodoc/core";
import type { IncomingMessage, ServerResponse } from "node:http";

export interface RawMdPluginOptions {
  /**
   * Whether to strip MDX component tags from the output.
   * When true, only pure markdown remains. When false, serves the source as-is.
   * Defaults to true.
   */
  clean?: boolean;

  /**
   * Whether to include YAML frontmatter in the output.
   * Defaults to true.
   */
  includeFrontmatter?: boolean;

  /**
   * Which content collections to generate .md files for.
   * When omitted, all collections are included: in custom mode every directory
   * under `src/content/`, in quick mode `docs`, `blog`, `changelog`, and any
   * configured sections that exist on disk.
   */
  collections?: string[];
}

interface PageFile {
  /** URL path the page is served at (e.g. "docs/en/introduction") */
  urlPath: string;
  /** Raw file content */
  raw: string;
}

// ---------------------------------------------------------------------------
// Markdown utilities
// ---------------------------------------------------------------------------

function extractFrontmatter(content: string): { frontmatter: string; body: string } {
  if (!content.startsWith("---")) return { frontmatter: "", body: content };
  const end = content.indexOf("---", 3);
  if (end === -1) return { frontmatter: "", body: content };
  return {
    frontmatter: content.slice(0, end + 3),
    body: content.slice(end + 3).trimStart(),
  };
}

/**
 * Minimal MDX cleaning — removes import statements and MDX component tags
 * while preserving markdown formatting and code blocks.
 */
function cleanMdx(md: string): string {
  const codeBlocks: string[] = [];
  let cleaned = md.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  cleaned = cleaned
    .replace(/import\s+.*?from\s+["'].*?["'];?\s*\n?/g, "")
    .replace(/<\/?(?:Callout|Steps|Step|Card|CardGroup|CodeGroup|CodeItem|ParamField|ParamFieldGroup|Tabs|Tab|Accordion|AccordionItem|Badge|Columns|Column|Expandable|Frame|FileTree|Tooltip|ResponseField|ApiReference|ApiEndpoint|ApiParams|ApiParam|ApiResponse|SimpleAccordion)[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n");

  for (let i = 0; i < codeBlocks.length; i++) {
    cleaned = cleaned.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
  }

  return cleaned.trim();
}

// ---------------------------------------------------------------------------
// File system scanning
// ---------------------------------------------------------------------------

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
 * Scan a content collection directory and build a list of page files
 * with their corresponding URL paths.
 */
function scanCollection(
  collectionDir: string,
  sectionSlug: string,
  locales: string[],
  defaultLocale: string
): PageFile[] {
  const files = walkMdFiles(collectionDir);
  const pages: PageFile[] = [];

  for (const relPath of files) {
    const raw = fs.readFileSync(path.join(collectionDir, relPath), "utf-8");
    const slug = relPath.replace(/\.(mdx?)$/, "").replace(/\\/g, "/");
    const parts = slug.split("/");

    let urlPath: string;
    if (locales.includes(parts[0])) {
      const locale = parts[0];
      const innerSlug = parts.slice(1).join("/");
      urlPath =
        locale === defaultLocale
          ? `${sectionSlug}/${innerSlug}`
          : `${sectionSlug}/${locale}/${innerSlug}`;
    } else {
      urlPath = `${sectionSlug}/${slug}`;
    }

    pages.push({ urlPath, raw });
  }

  return pages;
}

/**
 * Resolve which collection slugs to process when `collections` option is not set.
 * Custom mode: all directories under src/content/.
 * Quick mode: docs, blog, changelog, and configured sections that exist.
 */
function getDefaultCollectionSlugs(
  root: string,
  config: { sections?: Array<{ slug: string }> }
): string[] {
  const customModeBase = path.join(root, "src", "content");
  if (fs.existsSync(customModeBase)) {
    return fs
      .readdirSync(customModeBase, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  }
  const quickSlugs = [
    "docs",
    "blog",
    "changelog",
    ...((config.sections ?? []).map((s) => s.slug) ?? []),
  ];
  const unique = [...new Set(quickSlugs)];
  return unique.filter((slug) => {
    const dir = path.join(root, slug === "docs" ? "docs" : slug);
    return fs.existsSync(dir);
  });
}

function prepareContent(
  raw: string,
  clean: boolean,
  includeFrontmatter: boolean
): string {
  const { frontmatter, body } = extractFrontmatter(raw);
  const processedBody = clean ? cleanMdx(body) : body;

  if (includeFrontmatter && frontmatter) {
    return `${frontmatter}\n\n${processedBody}\n`;
  }
  return `${processedBody}\n`;
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

export default definePlugin<RawMdPluginOptions>((options = {}) => {
  const { clean = true, includeFrontmatter = true, collections } = options;

  return {
    name: "@barodoc/plugin-raw-md",

    hooks: {
      "build:done": async (buildContext, context) => {
        const { outDir } = buildContext;
        const { config, root } = context;

        const defaultLocale = (config as any).i18n?.defaultLocale ?? "en";
        const locales: string[] = (config as any).i18n?.locales ?? ["en"];

        const targetSlugs =
          collections ?? getDefaultCollectionSlugs(root, config as any);

        const customModeBase = path.join(root, "src", "content");
        const quickModeBase = root;
        const isCustomMode = fs.existsSync(customModeBase);

        let totalCount = 0;

        for (const slug of targetSlugs) {
          const collectionDir = isCustomMode
            ? path.join(customModeBase, slug)
            : path.join(quickModeBase, slug === "docs" ? "docs" : slug);

          if (!fs.existsSync(collectionDir)) continue;

          const pages = scanCollection(collectionDir, slug, locales, defaultLocale);

          for (const page of pages) {
            const content = prepareContent(page.raw, clean, includeFrontmatter);
            const outPath = path.join(outDir, `${page.urlPath}.md`);

            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, content, "utf-8");
            totalCount++;
          }
        }

        if (totalCount > 0) {
          console.log(
            `[@barodoc/plugin-raw-md] Generated ${totalCount} raw .md files`
          );
        } else {
          console.log(
            "[@barodoc/plugin-raw-md] No pages found, skipping .md generation."
          );
        }
      },
    },

    astroIntegration: (context) => ({
      name: "@barodoc/plugin-raw-md",
      hooks: {
        "astro:config:setup": ({ updateConfig }) => {
          const { config, root } = context;
          const defaultLocale = (config as any).i18n?.defaultLocale ?? "en";
          const locales: string[] = (config as any).i18n?.locales ?? ["en"];

          const targetSlugs =
            collections ?? getDefaultCollectionSlugs(root, config as any);

          const customModeBase = path.join(root, "src", "content");
          const quickModeBase = root;
          const isCustomMode = fs.existsSync(customModeBase);

          updateConfig({
            vite: {
              plugins: [
                {
                  name: "barodoc-raw-md-dev",
                  enforce: "pre" as const,
                  configureServer(server: any) {
                    const rawMdMiddleware = (
                      req: IncomingMessage,
                      res: ServerResponse,
                      next: () => void
                    ) => {
                      const rawUrl = req.url ?? "";
                      const url = rawUrl.replace(/\?[^#]*/, "").replace(/#.*$/, "");
                      if (!url || !url.endsWith(".md")) return next();

                      const urlPath = url.slice(1, -3);
                      const parts = urlPath.split("/");
                      if (parts.length < 2) return next();

                      const sectionSlug = parts[0];
                      if (!targetSlugs.includes(sectionSlug)) return next();

                      const restPath = parts.slice(1).join("/");

                      const collectionDir = isCustomMode
                        ? path.join(customModeBase, sectionSlug)
                        : path.join(
                            quickModeBase,
                            sectionSlug === "docs" ? "docs" : sectionSlug
                          );

                      if (!fs.existsSync(collectionDir)) return next();

                      const candidates: string[] = [];
                      const restParts = restPath.split("/");

                      if (locales.includes(restParts[0]) && restParts[0] !== defaultLocale) {
                        const locale = restParts[0];
                        const innerSlug = restParts.slice(1).join("/");
                        candidates.push(
                          path.join(collectionDir, locale, `${innerSlug}.mdx`),
                          path.join(collectionDir, locale, `${innerSlug}.md`)
                        );
                      } else {
                        candidates.push(
                          path.join(collectionDir, defaultLocale, `${restPath}.mdx`),
                          path.join(collectionDir, defaultLocale, `${restPath}.md`),
                          path.join(collectionDir, `${restPath}.mdx`),
                          path.join(collectionDir, `${restPath}.md`)
                        );
                      }

                      for (const filePath of candidates) {
                        if (fs.existsSync(filePath)) {
                          const raw = fs.readFileSync(filePath, "utf-8");
                          const content = prepareContent(
                            raw,
                            clean,
                            includeFrontmatter
                          );
                          res.setHeader(
                            "Content-Type",
                            "text/markdown; charset=utf-8"
                          );
                          res.end(content);
                          return;
                        }
                      }

                      next();
                    };

                    // Run after internal (and Astro) middlewares are installed, then
                    // prepend our middleware so .md requests are served first.
                    return () => {
                      const app = server.middlewares as { stack?: Array<{ route: string; handle: (req: IncomingMessage, res: ServerResponse, next: () => void) => void }> };
                      if (Array.isArray(app.stack)) {
                        app.stack.unshift({ route: "", handle: rawMdMiddleware });
                      } else {
                        server.middlewares.use(rawMdMiddleware);
                      }
                    };
                  },
                },
              ],
            },
          });
        },
      },
    }),
  };
});
