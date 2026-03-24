import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/theme.ts"],
  format: ["esm"],
  dts: false,
  outDir: "dist",
  clean: true,
  external: [
    "astro",
    "@barodoc/core",
    "@astrojs/mdx",
    "@astrojs/react",
    "@tailwindcss/vite",
    "remark-math",
    "rehype-katex",
    "mdast-util-find-and-replace",
  ],
});
