import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import type { ThemeExport, ResolvedBarodocConfig } from "@barodoc/core";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ASSET_EXTENSIONS } from "./lib/assetExtensions.js";
import { scanSectionAssets } from "./lib/scanAssets.js";

export interface DocsThemeOptions {
  customCss?: string[];
}

/** HAST node with optional children and properties */
interface HastNode {
  type: string;
  children?: HastNode[];
  properties?: Record<string, unknown>;
  tagName?: string;
  value?: string;
}

function getTextContent(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  if (node.children?.length) return node.children.map(getTextContent).join("");
  return "";
}

function isEmptyLine(node: HastNode): boolean {
  if (node.type !== "element" || node.tagName !== "span") return false;
  const cls = node.properties?.className;
  const isLine =
    Array.isArray(cls) && cls.some((c) => c === "line" || (typeof c === "string" && c.includes("line")));
  if (!isLine) return false;
  return /^\s*$/.test(getTextContent(node));
}

/** Removes leading and trailing empty span.line so only the code area is visible. */
function createTrimEmptyLinesTransformer() {
  return {
    name: "barodoc-trim-empty-lines",
    code(node: HastNode) {
      const lines = node.children;
      if (!lines?.length) return;
      let start = 0;
      let end = lines.length;
      while (start < end && isEmptyLine(lines[start])) start++;
      while (end > start && isEmptyLine(lines[end - 1])) end--;
      node.children = lines.slice(start, end);
    },
  };
}

function addClassToHast(node: unknown, cls: string): void {
  const n = node as { properties?: Record<string, unknown> };
  if (!n.properties) n.properties = {};
  const c = n.properties.className;
  if (Array.isArray(c)) c.push(cls);
  else if (typeof c === "string") n.properties.className = [c, cls];
  else n.properties.className = [cls];
}

function createLineNumbersTransformer() {
  return {
    name: "barodoc-line-numbers",
    addClassToHast,
    pre(node: { properties?: Record<string, unknown> }) {
      addClassToHast(node, "line-numbers");
    },
  };
}

function createAssetContentPlugin(buildOutDir: string) {
  return {
    name: "barodoc-asset-content",
    apply: "build" as const,
    closeBundle() {
      const contentDir = path.join(process.cwd(), "src", "content");
      if (!fs.existsSync(contentDir)) return;
      const sectionNames = fs.readdirSync(contentDir);
      for (const section of sectionNames) {
        const sectionPath = path.join(contentDir, section);
        if (!fs.statSync(sectionPath).isDirectory()) continue;
        const entries = scanSectionAssets(sectionPath, section);
        for (const entry of entries) {
          const src = path.join(sectionPath, entry.relPath);
          const dest = path.join(buildOutDir, "_content", section, entry.relPath);
          const destDir = path.dirname(dest);
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
          fs.copyFileSync(src, dest);
        }
      }
    },
  };
}

function createAssetContentDevPlugin() {
  return {
    name: "barodoc-asset-content-dev",
    apply: "serve" as const,
    configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req: { url?: string }, res: { statusCode: number; end: (s?: string) => void; setHeader: (k: string, v: string) => void }, next: () => void) => {
        if (!req.url?.startsWith("/_content/")) return next();
        const rawPath = req.url.slice("/_content/".length).split("?")[0];
        const contentDir = path.resolve(process.cwd(), "src", "content");
        const filePath = path.resolve(contentDir, rawPath);
        if (!filePath.startsWith(contentDir) || rawPath.includes("..")) {
          res.statusCode = 404;
          res.end();
          return;
        }
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          res.statusCode = 404;
          res.end();
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        if (!ASSET_EXTENSIONS.includes(ext as any)) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader("Content-Type", "application/octet-stream");
        fs.createReadStream(filePath).pipe(res as any);
      });
    },
  };
}

function createThemeIntegration(
  config: ResolvedBarodocConfig,
  options?: DocsThemeOptions
): AstroIntegration {
  const lineNumbers = config?.lineNumbers === true;
  return {
    name: "@barodoc/theme-docs",
    hooks: {
      "astro:config:setup": async ({ config: astroConfig, updateConfig, injectRoute, logger }) => {
        logger.info("Setting up Barodoc docs theme...");
        const rawOut = (astroConfig as unknown as { build?: { outDir?: string | URL } }).build;
        const outDir =
          typeof rawOut?.outDir === "string"
            ? rawOut.outDir
            : rawOut?.outDir instanceof URL
              ? fileURLToPath(rawOut.outDir)
              : "dist";

        injectRoute({
          pattern: "/",
          entrypoint: "@barodoc/theme-docs/pages/index.astro",
        });

        injectRoute({
          pattern: "/[section]/[...slug]",
          entrypoint: "@barodoc/theme-docs/pages/section/[...slug].astro",
        });

        if (config?.blog?.enabled !== false) {
          injectRoute({
            pattern: "/blog",
            entrypoint: "@barodoc/theme-docs/pages/blog/index.astro",
          });
          injectRoute({
            pattern: "/blog/[...slug]",
            entrypoint: "@barodoc/theme-docs/pages/blog/[...slug].astro",
          });
        }

        injectRoute({
          pattern: "/changelog",
          entrypoint: "@barodoc/theme-docs/pages/changelog/index.astro",
        });

        injectRoute({
          pattern: "/[...page]",
          entrypoint: "@barodoc/theme-docs/pages/[...page].astro",
        });

        updateConfig({
          integrations: [
            mdx({
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex],
            }),
            react(),
          ],
          vite: {
            plugins: [
              tailwindcss(),
              createAssetContentPlugin(outDir),
              createAssetContentDevPlugin(),
            ],
            optimizeDeps: {
              include: ["mermaid"],
            },
            ssr: {
              noExternal: [],
            },
            resolve: {
              dedupe: ["react", "react-dom"],
            },
          },
          markdown: {
            shikiConfig: {
              themes: {
                light: "github-light",
                dark: "github-dark",
              },
              transformers: [
                createTrimEmptyLinesTransformer(),
                ...(lineNumbers ? [createLineNumbersTransformer()] : []),
              ],
            },
          },
        });

        logger.info("Docs theme routes injected");
      },
    },
  };
}

export default function docsTheme(options?: DocsThemeOptions): ThemeExport {
  return {
    name: "@barodoc/theme-docs",
    integration: (config) => createThemeIntegration(config, options),
    styles: options?.customCss || [],
  };
}
