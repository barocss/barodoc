import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/config/index.ts",
    "src/i18n/index.ts",
    "src/plugins/index.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["astro", "vite"],
});
