import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { scanSectionAssets } from "./scanAssets.js";

const require = createRequire(import.meta.url);

export const TEX_PREGEN_DIR = ".astro/tex-generated";

/** Project root for .astro/tex-generated (set by theme so read path matches write path). */
export function getTexPreRenderCwd(): string {
  return process.env.BARODOC_PROJECT_ROOT || process.cwd();
}

/**
 * Resolve path to pre-rendered HTML for a .tex asset.
 * Returns path under TEX_PREGEN_DIR: <sectionSlug>/<relPath>.html
 */
export function getTexPreRenderedPath(
  sectionSlug: string,
  relPath: string,
  cwd: string = getTexPreRenderCwd()
): string {
  return path.join(cwd, TEX_PREGEN_DIR, sectionSlug, `${relPath}.html`);
}

/**
 * Read pre-rendered HTML for a .tex asset if it exists.
 */
export function readTexPreRendered(
  sectionSlug: string,
  relPath: string,
  cwd: string = getTexPreRenderCwd()
): string | null {
  const filePath = getTexPreRenderedPath(sectionSlug, relPath, cwd);
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return fs.readFileSync(filePath, "utf-8");
    }
  } catch {
    // ignore
  }
  return null;
}

function resolveLatexJsBin(cwd: string): string | null {
  const searchPaths = [
    cwd,
    __dirname,
    path.join(__dirname, "..", ".."),
    path.join(cwd, "node_modules", "@barodoc", "theme-docs"),
  ];
  for (const search of searchPaths) {
    try {
      const pkgPath = require.resolve("latex.js/package.json", { paths: [search] });
      const bin = path.join(path.dirname(pkgPath), "bin", "latex.js");
      if (fs.existsSync(bin)) return bin;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Run LaTeX.js CLI for a single .tex file. Used for dev watcher.
 */
export function buildOneTexToHtml(
  contentBasePath: string,
  cwd: string,
  sectionSlug: string,
  relPath: string,
  logger?: { info: (msg: string) => void; warn: (msg: string) => void }
): void {
  const srcPath = path.join(contentBasePath, sectionSlug, relPath);
  if (!fs.existsSync(srcPath)) return;

  const outRoot = path.join(cwd, TEX_PREGEN_DIR);
  const outDir = path.join(outRoot, sectionSlug, path.dirname(relPath));
  const outFile = path.join(outDir, path.basename(relPath) + ".html");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const latexJsBin = resolveLatexJsBin(cwd);
  if (!latexJsBin) {
    logger?.warn?.(`LaTeX.js not found, skipping ${relPath}`);
    return;
  }

  try {
    execSync(
      `node "${latexJsBin}" "${srcPath}" -o "${outFile}" -b -u "https://cdn.jsdelivr.net/npm/latex.js@0.12.1/dist/"`,
      { cwd, stdio: "pipe", encoding: "utf-8" }
    );
    logger?.info?.(`Pre-rendered .tex: ${relPath}`);
  } catch (err) {
    logger?.warn?.(`Could not pre-render ${relPath}: ${err}`);
  }
}

/**
 * Run LaTeX.js CLI to convert .tex to HTML (Node env: require() works).
 * Writes to TEX_PREGEN_DIR. Skips files that fail (client viewer will be used).
 */
export function buildAllTexToHtml(
  contentBasePath: string,
  cwd: string = process.cwd(),
  logger?: { info: (msg: string) => void; warn: (msg: string) => void }
): void {
  if (!fs.existsSync(contentBasePath)) {
    logger?.warn?.(`Tex pre-render: content dir not found: ${contentBasePath}`);
    return;
  }

  const sectionNames = fs.readdirSync(contentBasePath);
  const texEntries: { section: string; relPath: string }[] = [];

  for (const section of sectionNames) {
    const sectionPath = path.join(contentBasePath, section);
    if (!fs.statSync(sectionPath).isDirectory()) continue;

    const entries = scanSectionAssets(sectionPath, section).filter(
      (e) => e.ext.toLowerCase() === ".tex"
    );
    for (const entry of entries) {
      texEntries.push({ section, relPath: entry.relPath });
    }
  }

  if (texEntries.length === 0) {
    logger?.info?.("Tex pre-render: no .tex assets found.");
    return;
  }

  const latexJsBin = resolveLatexJsBin(cwd);
  if (!latexJsBin) {
    logger?.warn?.(
      "Tex pre-render: LaTeX.js CLI not found. .tex pages will use the browser viewer."
    );
    return;
  }

  for (const { section, relPath } of texEntries) {
    buildOneTexToHtml(contentBasePath, cwd, section, relPath, logger);
  }
}
