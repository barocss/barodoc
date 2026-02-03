import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [
    "astro",
    "vite",
    "react",
    "react-dom",
    "@barodoc/core",
    "@astrojs/mdx",
    "@astrojs/react",
    "@tailwindcss/vite",
    "tailwindcss",
    "lucide-react",
  ],
});
