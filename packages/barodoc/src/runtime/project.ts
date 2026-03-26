import crypto from "node:crypto";
import { createRequire } from "node:module";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execa } from "execa";
import pc from "picocolors";
import type { BarodocConfig } from "@barodoc/core";

const BARODOC_DIR = ".barodoc";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** CLI-only deps (not needed inside the Astro temp project). */
const EXCLUDE_FROM_TEMP = new Set([
  "cac",
  "execa",
  "chokidar",
  "fs-extra",
  "picocolors",
]);

function findMonorepoRoot(barodocPkgRoot: string): string | null {
  let dir = barodocPkgRoot;
  while (dir !== path.parse(dir).root) {
    const ws = path.join(dir, "pnpm-workspace.yaml");
    const marker = path.join(dir, "packages", "barodoc", "package.json");
    if (fs.existsSync(ws) && fs.existsSync(marker)) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function barodocMonorepoPackageDir(
  monorepoRoot: string,
  name: string
): string | null {
  if (!name.startsWith("@barodoc/")) return null;
  const rest = name.slice("@barodoc/".length);
  const abs = path.join(monorepoRoot, "packages", rest);
  return fs.existsSync(path.join(abs, "package.json")) ? abs : null;
}

function toFileDep(projectDir: string, targetDir: string): string {
  let rel = path.relative(projectDir, targetDir);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return `file:${rel.split(path.sep).join("/")}`;
}

function collectPluginNames(config: BarodocConfig): string[] {
  const plugins = config.plugins ?? [];
  const out: string[] = [];
  for (const p of plugins) {
    const name = Array.isArray(p) ? p[0] : p;
    if (typeof name === "string") out.push(name);
  }
  return [...new Set(out)];
}

function resolveDepVersion(
  name: string,
  ver: string,
  projectDir: string,
  barodocPkgRoot: string,
  monorepoRoot: string | null,
  req: NodeJS.Require
): string {
  if (monorepoRoot) {
    const pkgDir = barodocMonorepoPackageDir(monorepoRoot, name);
    if (pkgDir) return toFileDep(projectDir, pkgDir);
  }
  if (ver.startsWith("workspace:")) {
    try {
      const resolved = path.dirname(
        req.resolve(`${name}/package.json`, { paths: [barodocPkgRoot] })
      );
      return toFileDep(projectDir, resolved);
    } catch {
      throw new Error(
        `Cannot resolve ${name} for quick mode. Install barodoc from npm or run from the Barodoc monorepo.`
      );
    }
  }
  return ver;
}

function resolveExtraPlugin(
  name: string,
  projectDir: string,
  barodocPkgRoot: string,
  monorepoRoot: string | null,
  req: NodeJS.Require
): string {
  if (monorepoRoot) {
    const pkgDir = barodocMonorepoPackageDir(monorepoRoot, name);
    if (pkgDir) return toFileDep(projectDir, pkgDir);
  }
  if (name.startsWith("@barodoc/")) {
    try {
      const resolved = path.dirname(
        req.resolve(`${name}/package.json`, { paths: [barodocPkgRoot] })
      );
      return toFileDep(projectDir, resolved);
    } catch {
      return "*";
    }
  }
  return "*";
}

function resolveTempPackageJsonSync(
  projectDir: string,
  config: BarodocConfig,
  barodocPkgRoot: string,
  monorepoRoot: string | null
): {
  name: string;
  private: boolean;
  type: string;
  dependencies: Record<string, string>;
} {
  const raw = fs.readJsonSync(path.join(barodocPkgRoot, "package.json")) as {
    dependencies: Record<string, string>;
  };
  const req = createRequire(path.join(barodocPkgRoot, "package.json"));

  const deps: Record<string, string> = {};

  for (const [name, ver] of Object.entries(raw.dependencies)) {
    if (EXCLUDE_FROM_TEMP.has(name)) continue;
    deps[name] = resolveDepVersion(
      name,
      ver,
      projectDir,
      barodocPkgRoot,
      monorepoRoot,
      req
    );
  }

  for (const pluginName of collectPluginNames(config)) {
    if (deps[pluginName]) continue;
    deps[pluginName] = resolveExtraPlugin(
      pluginName,
      projectDir,
      barodocPkgRoot,
      monorepoRoot,
      req
    );
  }

  return {
    name: "barodoc-temp",
    private: true,
    type: "module",
    dependencies: deps,
  };
}

/**
 * In the monorepo, `file:` directory deps point outside `.barodoc/`, which breaks
 * Astro 5's compiler cache for virtual `?astro` CSS chunks. `npm pack` + `file:` `.tgz`
 * installs real files under `node_modules/@barodoc/*`.
 *
 * Tarballs must not contain `workspace:*` (npm install fails). We stage a copy and
 * replace workspace refs to sibling `@barodoc/*` with their **semver** from the
 * monorepo so npm can satisfy them from the root `file:` entries.
 */
async function materializeWorkspacePackagesAsTarballs(
  projectDir: string,
  deps: Record<string, string>,
  monorepoRoot: string
): Promise<Record<string, string>> {
  const packDir = path.join(projectDir, ".barodoc-packs");
  const packNpmCache = path.join(projectDir, ".npm-pack-cache");
  const stageRoot = path.join(packDir, ".stage");
  await fs.remove(stageRoot).catch(() => {});
  await fs.ensureDir(packDir);
  await fs.ensureDir(packNpmCache);

  const toPack: string[] = [];
  for (const name of Object.keys(deps)) {
    if (!name.startsWith("@barodoc/")) continue;
    const spec = deps[name];
    if (!spec.startsWith("file:")) continue;
    const rel = spec.replace(/^file:/, "").replace(/^\.\//, "");
    const absPath = path.resolve(projectDir, rel);
    try {
      const st = await fs.stat(absPath);
      if (!st.isDirectory()) continue;
    } catch {
      continue;
    }
    if (!(await fs.pathExists(path.join(absPath, "package.json")))) continue;
    toPack.push(name);
  }

  const tgzByPackage = new Map<string, string>();

  for (const name of toPack) {
    const spec = deps[name];
    const rel = spec!.replace(/^file:/, "").replace(/^\.\//, "");
    const srcDir = path.resolve(projectDir, rel);
    const folder = name.slice("@barodoc/".length);
    const stageDir = path.join(stageRoot, folder);
    await fs.remove(stageDir).catch(() => {});
    await fs.copy(srcDir, stageDir, {
      filter: (p) => !p.split(path.sep).includes("node_modules"),
      overwrite: true,
    });

    const pjPath = path.join(stageDir, "package.json");
    const pj = (await fs.readJSON(pjPath)) as Record<string, unknown>;
    for (const sect of [
      "dependencies",
      "peerDependencies",
      "optionalDependencies",
      "devDependencies",
    ] as const) {
      const o = pj[sect] as Record<string, string> | undefined;
      if (!o) continue;
      for (const [depName, depVer] of Object.entries(o)) {
        if (!depName.startsWith("@barodoc/")) continue;
        if (
          depVer !== "workspace:*" &&
          !String(depVer).startsWith("workspace:")
        ) {
          continue;
        }
        const depDir = barodocMonorepoPackageDir(monorepoRoot, depName);
        if (!depDir) continue;
        const ver = (
          fs.readJsonSync(path.join(depDir, "package.json")) as {
            version: string;
          }
        ).version;
        o[depName] = ver;
      }
    }
    await fs.writeJSON(pjPath, pj, { spaces: 2 });

    const { stdout } = await execa(
      "npm",
      ["pack", "--pack-destination", packDir, "--cache", packNpmCache],
      { cwd: stageDir }
    );
    const lines = stdout
      .trim()
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const tgz = lines[lines.length - 1];
    if (!tgz) {
      throw new Error(`npm pack produced no tarball for ${name}`);
    }
    tgzByPackage.set(name, tgz);
  }

  await fs.remove(stageRoot).catch(() => {});

  const next = { ...deps };
  for (const name of toPack) {
    const tgz = tgzByPackage.get(name);
    if (!tgz) continue;
    const tgzAbs = path.join(packDir, tgz);
    let relOut = path.relative(projectDir, tgzAbs);
    if (!relOut.startsWith(".")) relOut = `./${relOut}`;
    next[name] = `file:${relOut.split(path.sep).join("/")}`;
  }
  return next;
}

function hashQuickModeDeps(
  pkgJson: { dependencies: Record<string, string> },
  monorepoRoot: string | null
): string {
  const lines = Object.keys(pkgJson.dependencies)
    .sort()
    .map((k) => `${k}@${pkgJson.dependencies[k]}`);
  const parts = [lines.join("\n")];
  if (monorepoRoot) {
    for (const name of Object.keys(pkgJson.dependencies)) {
      if (!name.startsWith("@barodoc/")) continue;
      const dir = barodocMonorepoPackageDir(monorepoRoot, name);
      if (!dir) continue;
      const pj = path.join(dir, "package.json");
      if (!fs.existsSync(pj)) continue;
      const v = fs.readJsonSync(pj) as { version?: string };
      parts.push(`${name}:src@${v.version ?? "0.0.0"}`);
    }
  }
  return crypto.createHash("sha256").update(parts.join("\n")).digest("hex");
}

/** Used by Vitest and tooling that mirrors quick-mode dependency resolution. */
export { findMonorepoRoot, hashQuickModeDeps, resolveTempPackageJsonSync };

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
 * Uses a dedicated `npm install` under `.barodoc/` (not a symlink to the CLI
 * or monorepo root `node_modules`) so quick mode matches real installs and
 * avoids hoisted dev-tooling conflicts.
 */
export async function createProject(options: ProjectOptions): Promise<string> {
  const { root, docsDir, config } = options;
  const projectDir = path.join(root, BARODOC_DIR);

  console.log(pc.dim(`Creating temporary project in ${BARODOC_DIR}/`));

  await fs.ensureDir(projectDir);

  const nodeModulesPath = path.join(projectDir, "node_modules");
  if (await fs.pathExists(nodeModulesPath)) {
    const st = await fs.lstat(nodeModulesPath);
    if (st.isSymbolicLink()) {
      await fs.remove(nodeModulesPath);
    }
  }

  const barodocPkgRoot = path.join(__dirname, "..");
  const monorepoRoot = findMonorepoRoot(barodocPkgRoot);
  const pkgSync = resolveTempPackageJsonSync(
    projectDir,
    config,
    barodocPkgRoot,
    monorepoRoot
  );
  const hash = hashQuickModeDeps(pkgSync, monorepoRoot);
  const hashFile = path.join(projectDir, ".barodoc-deps-hash");
  const astroMarker = path.join(nodeModulesPath, "astro", "package.json");
  let prevHash = "";
  try {
    prevHash = await fs.readFile(hashFile, "utf8");
  } catch {
    prevHash = "";
  }
  const needInstall = !(await fs.pathExists(astroMarker)) || prevHash !== hash;

  if (needInstall) {
    if (await fs.pathExists(nodeModulesPath)) {
      await fs.remove(nodeModulesPath);
    }
    await fs.remove(path.join(projectDir, ".barodoc-packs")).catch(() => {});
    await fs.remove(path.join(projectDir, ".npm-pack-cache")).catch(() => {});
    console.log(pc.dim("  Installing dependencies in .barodoc/ (npm install)…"));
    let pkgFinal = pkgSync;
    if (monorepoRoot) {
      pkgFinal = {
        ...pkgSync,
        dependencies: await materializeWorkspacePackagesAsTarballs(
          projectDir,
          pkgSync.dependencies,
          monorepoRoot
        ),
      };
    }
    await fs.writeJSON(path.join(projectDir, "package.json"), pkgFinal, {
      spaces: 2,
    });
    const npmCache = path.join(projectDir, ".npm-cache");
    await fs.ensureDir(npmCache);
    await execa(
      "npm",
      [
        "install",
        "--no-fund",
        "--no-audit",
        "--legacy-peer-deps",
        "--cache",
        npmCache,
      ],
      {
        cwd: projectDir,
        stdio: "inherit",
      }
    );
    await fs.writeFile(hashFile, hash, "utf8");
  }

  await fs.remove(path.join(projectDir, "src"));
  await fs.remove(path.join(projectDir, "public"));
  await fs.remove(path.join(projectDir, "overrides"));

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

  await fs.writeFile(
    path.join(projectDir, "astro.config.mjs"),
    generateAstroConfigFile(config),
    "utf-8"
  );

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
 * Generate Astro config file content (quick mode `.barodoc/` and `barodoc eject`).
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
      preserveSymlinks: false,
      dedupe: ["react", "react-dom"],
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
      noExternal: [/^@barodoc\\//],
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
    slides: z.boolean().optional(),
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
