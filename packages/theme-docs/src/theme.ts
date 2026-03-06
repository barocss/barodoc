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
import { buildAllTexToHtml, buildOneTexToHtml, TEX_PREGEN_DIR } from "./lib/texPreRender.js";

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
      const root = process.env.BARODOC_PROJECT_ROOT || process.cwd();
      const contentDir = path.join(root, "src", "content");
      if (fs.existsSync(contentDir)) {
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
      }
      const texGenDir = path.join(root, TEX_PREGEN_DIR);
      if (fs.existsSync(texGenDir)) {
        const destTex = path.join(buildOutDir, "_tex-generated");
        if (!fs.existsSync(destTex)) fs.mkdirSync(destTex, { recursive: true });
        const copyDir = (src: string, dest: string) => {
          const names = fs.readdirSync(src);
          for (const name of names) {
            const srcP = path.join(src, name);
            const destP = path.join(dest, name);
            if (fs.statSync(srcP).isDirectory()) {
              if (!fs.existsSync(destP)) fs.mkdirSync(destP, { recursive: true });
              copyDir(srcP, destP);
            } else {
              fs.copyFileSync(srcP, destP);
            }
          }
        };
        copyDir(texGenDir, destTex);
      }
    },
  };
}

function createTexPreRenderDevPlugin(contentDir: string) {
  const cwd = path.dirname(path.dirname(contentDir));
  return {
    name: "barodoc-tex-prerender-dev",
    apply: "serve" as const,
    configureServer(server: { watcher?: { on: (e: string, fn: (p: string) => void) => void } }) {
      // Initial pre-render already runs in astro:config:setup; here we only watch for .tex changes
      const devLogger = {
        info: (msg: string) => console.log("[barodoc] " + msg),
        warn: (msg: string) => console.warn("[barodoc] " + msg),
      };
      const watcher = server?.watcher;
      if (watcher) {
        const onTexChange = (filePath: string) => {
          if (path.extname(filePath) !== ".tex") return;
          const resolvedContent = path.resolve(contentDir);
          if (!filePath.startsWith(resolvedContent)) return;
          const relative = path.relative(resolvedContent, filePath);
          const parts = relative.split(path.sep);
          if (parts.length < 2) return;
          const sectionSlug = parts[0];
          const relPath = parts.slice(1).join(path.sep);
          try {
            buildOneTexToHtml(contentDir, cwd, sectionSlug, relPath, devLogger);
          } catch {
            // ignore
          }
        };
        watcher.on("change", onTexChange);
        watcher.on("add", onTexChange);
      }
    },
  };
}

function createAssetContentDevPlugin(contentDir: string) {
  const cwd = path.dirname(path.dirname(contentDir));
  const texGenRoot = path.join(cwd, TEX_PREGEN_DIR);
  return {
    name: "barodoc-asset-content-dev",
    apply: "serve" as const,
    configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req: { url?: string }, res: { statusCode: number; end: (s?: string) => void; setHeader: (k: string, v: string) => void }, next: () => void) => {
        if (req.url?.startsWith("/_tex-generated/")) {
          const rawPath = req.url.slice("/_tex-generated/".length).split("?")[0];
          const filePath = path.join(texGenRoot, rawPath);
          if (!filePath.startsWith(texGenRoot) || rawPath.includes("..") || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            res.statusCode = 404;
            res.end();
            return;
          }
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          fs.createReadStream(filePath).pipe(res as any);
          return;
        }
        if (!req.url?.startsWith("/_content/")) return next();
        const rawPath = req.url.slice("/_content/".length).split("?")[0];
        const resolvedContentDir = path.resolve(contentDir);
        const filePath = path.resolve(resolvedContentDir, rawPath);
        if (!filePath.startsWith(resolvedContentDir) || rawPath.includes("..")) {
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
        const mime: Record<string, string> = {
          ".html": "text/html; charset=utf-8",
          ".pdf": "application/pdf",
          ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          ".tex": "text/plain; charset=utf-8",
          ".odt": "application/vnd.oasis.opendocument.text",
          ".ods": "application/vnd.oasis.opendocument.spreadsheet",
          ".odp": "application/vnd.oasis.opendocument.presentation",
          ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ".ipynb": "application/json",
          ".csv": "text/csv; charset=utf-8",
          ".rst": "text/plain; charset=utf-8",
          ".epub": "application/epub+zip",
        };
        res.setHeader("Content-Type", mime[ext] ?? "application/octet-stream");
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
      "build:start": async () => {
        // Tex pre-render already runs in astro:config:setup for both dev and build
      },
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

        const contentDirForPlugins = path.join(
          typeof astroConfig.root === "object" && astroConfig.root instanceof URL
            ? fileURLToPath(astroConfig.root)
            : String(astroConfig.root ?? process.cwd()),
          "src",
          "content"
        );
        const projectRoot = path.dirname(path.dirname(contentDirForPlugins));
        process.env.BARODOC_PROJECT_ROOT = projectRoot;

        if (fs.existsSync(contentDirForPlugins)) {
          try {
            logger.info("Tex pre-render: building .tex → HTML...");
            buildAllTexToHtml(contentDirForPlugins, projectRoot, {
              info: (msg) => logger.info(msg),
              warn: (msg) => logger.warn(msg),
            });
          } catch (e) {
            logger.warn(`Tex pre-render failed: ${e}`);
          }
        } else {
          logger.warn(`Tex pre-render skipped: content dir not found (${contentDirForPlugins})`);
        }

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
              createTexPreRenderDevPlugin(contentDirForPlugins),
              createAssetContentDevPlugin(contentDirForPlugins),
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
