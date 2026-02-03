import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts", "src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [
    "@barodoc/core",
    "@barodoc/theme-docs",
    "astro",
  ],
});
