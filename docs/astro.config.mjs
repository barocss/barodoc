import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import barodoc from "@barodoc/core";
import docsTheme from "@barodoc/theme-docs/theme";
import { serveAtFsPlugin } from "./vite-plugin-serve-at-fs.mjs";

const root = resolve(fileURLToPath(import.meta.url), "..");
const monorepoRoot = resolve(root, "..");
const themeDocsPath = resolve(monorepoRoot, "packages/theme-docs");
const fsAllow = [root, monorepoRoot, themeDocsPath];

export default defineConfig({
  site: "https://barodoc.dev",
  // i18n must be set here, not through updateConfig, due to Astro 5.x merge issue
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ko"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    barodoc({
      config: "./barodoc.config.json",
      theme: docsTheme(),
    }),
  ],
  vite: {
    plugins: [serveAtFsPlugin(fsAllow)],
    server: {
      fs: { allow: fsAllow },
    },
    optimizeDeps: {
      include: ["mermaid"],
      exclude: [
        "fsevents",
        "lightningcss",
        "@tailwindcss/oxide",
        "@barodoc/core",
      ],
    },
    ssr: {
      external: [
        "fsevents",
        "lightningcss",
        "mermaid",
        "d3-array",
        "d3-contour",
      ],
      noExternal: ["@barodoc/theme-docs", "@barodoc/core"],
    },
    resolve: {
      dedupe: ["react", "react-dom"],
      preserveSymlinks: true,
    },
  },
});
