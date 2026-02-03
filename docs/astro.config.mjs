import { defineConfig } from "astro/config";
import barodoc from "@barodoc/core";
import docsTheme from "@barodoc/theme-docs";

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
    optimizeDeps: {
      // Exclude native modules and workspace packages from dependency optimization
      exclude: [
        "fsevents",
        "lightningcss",
        "@tailwindcss/oxide",
        "@barodoc/theme-docs",
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
