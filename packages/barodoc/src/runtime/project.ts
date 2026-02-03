import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import type { BarodocConfig } from "@barodoc/core";

const BARODOC_DIR = ".barodoc";

export interface ProjectOptions {
  root: string;
  docsDir: string;
  config: BarodocConfig;
  configPath?: string;
}

/**
 * Check if directory is a full custom project (has astro.config)
 */
export function isCustomProject(dir: string): boolean {
  return (
    fs.existsSync(path.join(dir, "astro.config.mjs")) ||
    fs.existsSync(path.join(dir, "astro.config.ts")) ||
    fs.existsSync(path.join(dir, "astro.config.js"))
  );
}

/**
 * Load barodoc config from directory
 */
export async function loadProjectConfig(
  dir: string,
  configFile?: string
): Promise<{ config: BarodocConfig; configPath: string | null }> {
  const configPath = configFile
    ? path.resolve(dir, configFile)
    : path.join(dir, "barodoc.config.json");

  if (fs.existsSync(configPath)) {
    const content = await fs.readFile(configPath, "utf-8");
    return {
      config: JSON.parse(content),
      configPath,
    };
  }

  // Return default config if not found
  return {
    config: getDefaultConfig(),
    configPath: null,
  };
}

/**
 * Get default config
 */
export function getDefaultConfig(): BarodocConfig {
  return {
    name: "Documentation",
    navigation: [],
    i18n: {
      defaultLocale: "en",
      locales: ["en"],
    },
    search: {
      enabled: true,
    },
  };
}

/**
 * Create temporary Astro project for quick mode
 */
export async function createProject(options: ProjectOptions): Promise<string> {
  const { root, docsDir, config, configPath } = options;
  const projectDir = path.join(root, BARODOC_DIR);

  console.log(pc.dim(`Creating temporary project in ${BARODOC_DIR}/`));

  // Clean up existing
  await fs.remove(projectDir);
  await fs.ensureDir(projectDir);

  // Create package.json
  await fs.writeJSON(
    path.join(projectDir, "package.json"),
    {
      name: "barodoc-temp",
      type: "module",
      private: true,
    },
    { spaces: 2 }
  );

  // Create astro.config.mjs
  const astroConfig = generateAstroConfig(config, configPath || null, docsDir);
  await fs.writeFile(path.join(projectDir, "astro.config.mjs"), astroConfig);

  // Create tsconfig.json
  await fs.writeJSON(
    path.join(projectDir, "tsconfig.json"),
    {
      extends: "astro/tsconfigs/strict",
      compilerOptions: {
        jsx: "react-jsx",
        jsxImportSource: "react",
      },
    },
    { spaces: 2 }
  );

  // Create barodoc.config.json in temp dir
  const tempConfigPath = path.join(projectDir, "barodoc.config.json");
  await fs.writeJSON(tempConfigPath, config, { spaces: 2 });

  // Create src/content structure
  const contentDir = path.join(projectDir, "src/content");
  await fs.ensureDir(contentDir);

  // Create content config
  await fs.writeFile(
    path.join(contentDir, "config.ts"),
    generateContentConfig()
  );

  // Symlink docs directory
  const docsAbsolute = path.resolve(root, docsDir);
  const docsLink = path.join(contentDir, "docs");
  
  if (fs.existsSync(docsAbsolute)) {
    await fs.symlink(docsAbsolute, docsLink, "dir");
  } else {
    // Create empty docs dir if doesn't exist
    await fs.ensureDir(docsLink);
  }

  // Symlink public directory if exists
  const publicDir = path.join(root, "public");
  const publicLink = path.join(projectDir, "public");
  
  if (fs.existsSync(publicDir)) {
    await fs.symlink(publicDir, publicLink, "dir");
  } else {
    await fs.ensureDir(publicLink);
  }

  return projectDir;
}

/**
 * Clean up temporary project
 */
export async function cleanupProject(root: string): Promise<void> {
  const projectDir = path.join(root, BARODOC_DIR);
  await fs.remove(projectDir);
}

/**
 * Generate Astro config content
 */
function generateAstroConfig(
  config: BarodocConfig,
  configPath: string | null,
  docsDir: string
): string {
  return `import { defineConfig } from "astro/config";
import barodoc from "@barodoc/core";
import docsTheme from "@barodoc/theme-docs";

export default defineConfig({
  integrations: [
    barodoc({
      config: "./barodoc.config.json",
      theme: docsTheme(),
    }),
  ],
});
`;
}

/**
 * Generate content collection config
 */
function generateContentConfig(): string {
  return `import { defineCollection, z } from "astro:content";

const docsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = {
  docs: docsCollection,
};
`;
}

/**
 * Find docs directory in project
 */
export function findDocsDir(root: string): string {
  const candidates = ["docs", "content", "src/content/docs"];

  for (const candidate of candidates) {
    const fullPath = path.join(root, candidate);
    if (fs.existsSync(fullPath)) {
      return candidate;
    }
  }

  // Default to docs
  return "docs";
}
