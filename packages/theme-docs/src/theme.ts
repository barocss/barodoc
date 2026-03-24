import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ViteDevServer } from "vite";
import type { AstroIntegration } from "astro";
import type { ThemeExport, ResolvedBarodocConfig } from "@barodoc/core";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ASSET_EXTENSIONS } from "./lib/assetExtensions.js";
import { scanSectionAssets } from "./lib/scanAssets.js";
import { remarkWikiLink, createWikiIndexCache } from "./lib/remarkWikiLink.js";
import { writeWikiGraphJson } from "./lib/wikiGraph.js";

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
    },
  };
}

function createAssetContentDevPlugin(contentDir: string) {
  const cwd = path.dirname(path.dirname(contentDir));
  const assetMiddleware = (req: { url?: string }, res: { statusCode: number; end: (s?: string) => void; setHeader: (k: string, v: string) => void }, next: () => void) => {
        const pathname = req.url?.split("?")[0] ?? "";
        if (pathname.startsWith("/Users/") || pathname.includes("/.worktrees/") || pathname.includes("/packages/theme-docs/src/")) {
          res.statusCode = 404;
          res.end();
          return;
        }
        if (pathname === "/docs" || pathname === "/docs/") {
          res.statusCode = 302;
          res.setHeader("Location", "/docs/introduction");
          res.end();
          return;
        }
        if (!req.url?.startsWith("/_content/")) return next();
        let rawPath = req.url.slice("/_content/".length).split("?")[0];
        try {
          rawPath = decodeURIComponent(rawPath);
        } catch {
          // leave as-is if decode fails
        }
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
  };
  return {
    name: "barodoc-asset-content-dev",
    apply: "serve" as const,
    configureServer(server: ViteDevServer) {
      // Prepend so we run before Astro's catch-all router (which would 404 /_content/)
      const middlewares = server.middlewares as {
        use: (fn: (req: any, res: any, next: () => void) => void) => void;
        stack?: Array<{ route: string; handle: (req: any, res: any, next: () => void) => void }>;
      };
      if (Array.isArray(middlewares.stack)) {
        middlewares.stack.unshift({ route: "", handle: assetMiddleware });
      } else {
        middlewares.use(assetMiddleware);
      }
    },
  };
}

/**
 * True when `file` is under `src/content`. Used so writes to `public/graph.json`
 * do not retrigger wiki/graph watchers (would loop: write → watch → regen → write…).
 */
function isContentTreeFile(projectRoot: string, file: string): boolean {
  const contentRoot = path.resolve(projectRoot, "src", "content");
  try {
    const resolved = path.resolve(file);
    return (
      resolved === contentRoot || resolved.startsWith(contentRoot + path.sep)
    );
  } catch {
    return false;
  }
}

function createWikiIndexRefreshPlugin(
  projectRoot: string,
  barodocConfig: ResolvedBarodocConfig,
  cache: ReturnType<typeof createWikiIndexCache>,
) {
  return {
    name: "barodoc-wiki-index-refresh",
    buildStart() {
      cache.invalidate();
    },
    configureServer(server: ViteDevServer) {
      const contentRoot = path.join(projectRoot, "src", "content");
      if (fs.existsSync(contentRoot)) {
        server.watcher.add(contentRoot);
      }
      const invalidate = (file: string) => {
        if (!isContentTreeFile(projectRoot, file)) return;
        cache.invalidate();
      };
      server.watcher.on("change", invalidate);
      server.watcher.on("add", invalidate);
      server.watcher.on("unlink", invalidate);
    },
  };
}

function createWikiGraphPlugin(
  projectRoot: string,
  barodocConfig: ResolvedBarodocConfig,
  buildOutDir: string,
) {
  let debounce: ReturnType<typeof setTimeout> | null = null;
  const publicGraph = path.join(projectRoot, "public", "graph.json");

  const writePublic = () => {
    try {
      writeWikiGraphJson(projectRoot, barodocConfig, publicGraph);
    } catch (e) {
      console.warn("[@barodoc/theme-docs] wiki graph:", e);
    }
  };

  const schedulePublic = () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(writePublic, 350);
  };

  return {
    name: "barodoc-wiki-graph",
    buildStart() {
      writePublic();
    },
    configureServer(server: ViteDevServer) {
      writePublic();
      const contentRoot = path.join(projectRoot, "src", "content");
      if (fs.existsSync(contentRoot)) {
        server.watcher.add(contentRoot);
      }
      const onContentChange = (file: string) => {
        if (!isContentTreeFile(projectRoot, file)) return;
        schedulePublic();
      };
      server.watcher.on("change", onContentChange);
      server.watcher.on("add", onContentChange);
      server.watcher.on("unlink", onContentChange);
    },
    closeBundle() {
      try {
        writeWikiGraphJson(
          projectRoot,
          barodocConfig,
          path.join(buildOutDir, "graph.json"),
        );
      } catch (e) {
        console.warn("[@barodoc/theme-docs] wiki graph (build):", e);
      }
    },
  };
}

function createThemeIntegration(
  config: ResolvedBarodocConfig,
  options?: DocsThemeOptions
): AstroIntegration {
  const lineNumbers = config?.lineNumbers === true;
  const wikiIndexCache = createWikiIndexCache();
  return {
    name: "@barodoc/theme-docs",
    hooks: {
      "build:start": async () => { },
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
          pattern: "/graph",
          entrypoint: "@barodoc/theme-docs/pages/graph/index.astro",
        });

        injectRoute({
          pattern: "/[...page]",
          entrypoint: "@barodoc/theme-docs/pages/[...page].astro",
        });

        const rootDir =
          typeof astroConfig.root === "object" && astroConfig.root instanceof URL
            ? fileURLToPath(astroConfig.root)
            : String(astroConfig.root ?? process.cwd());
        const contentDirForPlugins = path.resolve(rootDir, "src", "content");
        const projectRoot = path.dirname(path.dirname(contentDirForPlugins));
        process.env.BARODOC_PROJECT_ROOT = projectRoot;

        updateConfig({
          integrations: [
            mdx({
              remarkPlugins: [
                remarkWikiLink({
                  projectRoot,
                  config,
                  getWikiIndex: () => wikiIndexCache.get(projectRoot, config),
                }),
                remarkMath,
              ],
              rehypePlugins: [rehypeKatex],
            }),
            react(),
          ],
          vite: {
            plugins: [
              tailwindcss(),
              createAssetContentPlugin(outDir),
              createAssetContentDevPlugin(contentDirForPlugins),
              createWikiIndexRefreshPlugin(projectRoot, config, wikiIndexCache),
              createWikiGraphPlugin(projectRoot, config, outDir),
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
