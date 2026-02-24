import type { AstroIntegration } from "astro";
import type { ThemeExport, ResolvedBarodocConfig } from "@barodoc/core";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

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

function createLineNumbersTransformer() {
  return {
    name: "barodoc-line-numbers",
    pre(node: { properties?: Record<string, unknown> }) {
      (this as { addClassToHast: (node: unknown, cls: string) => void }).addClassToHast(node, "line-numbers");
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
      "astro:config:setup": async ({ updateConfig, injectRoute, logger }) => {
        logger.info("Setting up Barodoc docs theme...");

        injectRoute({
          pattern: "/",
          entrypoint: "@barodoc/theme-docs/pages/index.astro",
        });

        injectRoute({
          pattern: "/docs/[...slug]",
          entrypoint: "@barodoc/theme-docs/pages/docs/[...slug].astro",
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

        updateConfig({
          integrations: [
            mdx({
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex],
            }),
            react(),
          ],
          vite: {
            plugins: [tailwindcss()],
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
