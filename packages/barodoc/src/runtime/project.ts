import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import pc from "picocolors";
import type { BarodocConfig } from "@barodoc/core";

const BARODOC_DIR = ".barodoc";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Walk up from the CLI's dist directory to find the best node_modules
 * for Astro's module resolution. Prefers the highest ancestor that
 * has all transitive deps (e.g. monorepo root). Works with npm, pnpm, npx.
 */
function findCliNodeModules(): string {
  let best: string | null = null;
  let dir = __dirname;
  while (dir !== path.parse(dir).root) {
    const candidate = path.join(dir, "node_modules");
    if (
      fs.existsSync(candidate) &&
      fs.existsSync(path.join(candidate, "@barodoc", "theme-docs"))
    ) {
      best = candidate;
    }
    dir = path.dirname(dir);
  }
  if (!best) {
    throw new Error(
      "Could not locate node_modules for barodoc runtime dependencies"
    );
  }
  return best;
}

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
 * Create temporary Astro project for quick mode.
 * Only generates config files and content symlinks — no node_modules needed.
 * Astro is invoked programmatically from the CLI process.
 */
export async function createProject(options: ProjectOptions): Promise<string> {
  const { root, docsDir, config } = options;
  const projectDir = path.join(root, BARODOC_DIR);

  console.log(pc.dim(`Creating temporary project in ${BARODOC_DIR}/`));

  await fs.remove(projectDir);
  await fs.ensureDir(projectDir);

  // Symlink node_modules so Astro can resolve injected routes & components
  const cliNodeModules = findCliNodeModules();
  await fs.symlink(cliNodeModules, path.join(projectDir, "node_modules"), "junction");

  await fs.writeJSON(
    path.join(projectDir, "package.json"),
    { name: "barodoc-temp", private: true },
    { spaces: 2 }
  );

  // Create barodoc.config.json in temp dir
  await fs.writeJSON(path.join(projectDir, "barodoc.config.json"), config, {
    spaces: 2,
  });

  // Create tsconfig.json (needed for Astro TypeScript support)
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

  const contentDir = path.join(projectDir, "src/content");
  await fs.ensureDir(contentDir);

  // Copy docs directory (symlinks not followed by Astro's content sync)
  const docsAbsolute = path.resolve(root, docsDir);
  const docsLink = path.join(contentDir, "docs");

  if (fs.existsSync(docsAbsolute)) {
    await fs.copy(docsAbsolute, docsLink);
  } else {
    await fs.ensureDir(docsLink);
  }

  // Copy blog directory if exists
  const blogDir = path.join(root, "blog");
  const blogLink = path.join(contentDir, "blog");
  if (fs.existsSync(blogDir)) {
    await fs.copy(blogDir, blogLink);
  }

  // Copy changelog directory if exists
  const changelogDir = path.join(root, "changelog");
  const changelogLink = path.join(contentDir, "changelog");
  if (fs.existsSync(changelogDir)) {
    await fs.copy(changelogDir, changelogLink);
  }

  // Copy additional section directories (help/, guides/, etc.)
  if (config.sections) {
    for (const section of config.sections) {
      const sectionDir = path.join(root, section.slug);
      const sectionDest = path.join(contentDir, section.slug);
      if (fs.existsSync(sectionDir)) {
        await fs.copy(sectionDir, sectionDest);
        console.log(pc.dim(`  Copied ${section.slug}/ section`));
      }
    }
  }

  // Copy pages directory for standalone pages
  const pagesDir = path.join(root, "pages");
  const pagesDest = path.join(contentDir, "pages");
  if (fs.existsSync(pagesDir)) {
    await fs.copy(pagesDir, pagesDest);
    console.log(pc.dim("  Copied pages/ directory"));
  }

  // Write content.config.ts so all collections (docs, blog, changelog, pages, sections) exist
  await fs.writeFile(
    path.join(contentDir, "config.ts"),
    generateContentConfig(config),
    "utf-8"
  );

  // Symlink public directory if exists
  const publicDir = path.join(root, "public");
  const publicLink = path.join(projectDir, "public");

  if (fs.existsSync(publicDir)) {
    await fs.symlink(publicDir, publicLink, "dir");
  } else {
    await fs.ensureDir(publicLink);
  }

  // Symlink overrides directory if exists
  const overridesDir = path.join(root, "overrides");
  const overridesLink = path.join(projectDir, "overrides");

  if (fs.existsSync(overridesDir)) {
    await fs.symlink(overridesDir, overridesLink, "dir");
    console.log(pc.dim("  Linked overrides/ directory"));
  }

  return projectDir;
}

/**
 * Clean up temporary project (remove everything).
 */
export async function cleanupProject(root: string): Promise<void> {
  const projectDir = path.join(root, BARODOC_DIR);
  if (fs.existsSync(projectDir)) {
    await fs.remove(projectDir);
  }
}

/**
 * Generate Astro config file content (used only for eject command)
 */
export function generateAstroConfigFile(config: BarodocConfig): string {
  const siteLine = config.site
    ? `\n  site: ${JSON.stringify(config.site)},`
    : "";
  const baseLine = config.base
    ? `\n  base: ${JSON.stringify(config.base)},`
    : "";

  return `import { defineConfig } from "astro/config";
import barodoc from "@barodoc/core";
import docsTheme from "@barodoc/theme-docs/theme";

export default defineConfig({${siteLine}${baseLine}
  integrations: [
    barodoc({
      config: "./barodoc.config.json",
      theme: docsTheme(),
    }),
  ],
  vite: {
    resolve: {
      preserveSymlinks: true,
    },
    ssr: {
      noExternal: true,
    },
  },
});
`;
}

const contentSchema = `z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
    category: z.string().optional(),
    api_reference: z.boolean().optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    lastUpdated: z.date().optional(),
    since: z.string().optional(),
    deprecated: z.union([z.boolean(), z.string()]).optional(),
    experimental: z.boolean().optional(),
    changelogUrl: z.string().optional(),
  })`;

function generateContentConfig(config: BarodocConfig): string {
  const collections: string[] = [
    `docs: defineCollection({ type: "content", schema: ${contentSchema} })`,
    `blog: defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    date: z.coerce.date().optional(),
    author: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
})`,
    `changelog: defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    version: z.string(),
    date: z.coerce.date(),
  }),
})`,
    `pages: defineCollection({ type: "content", schema: ${contentSchema} })`,
  ];
  const sections = config.sections ?? [];
  for (const section of sections) {
    collections.push(
      `${section.slug}: defineCollection({ type: "content", schema: ${contentSchema} })`
    );
  }
  return `import { defineCollection, z } from "astro:content";

export const collections = {
  ${collections.join(",\n  ")},
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

  return "docs";
}
