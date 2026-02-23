import path from "path";
import pc from "picocolors";
import fs from "fs-extra";
import { loadProjectConfig } from "../runtime/project.js";

interface CheckOptions {
  config?: string;
  fix?: boolean;
}

interface CheckResult {
  missingFiles: Array<{ slug: string; locale: string; groupIndex: number; pageIndex: number }>;
  orphanFiles: Array<{ slug: string; locale: string; filePath: string }>;
  missingFrontmatter: Array<{ filePath: string; fields: string[] }>;
}

/**
 * Recursively collect markdown/mdx slugs relative to baseDir.
 */
async function collectSlugs(baseDir: string, prefix: string = ""): Promise<string[]> {
  const slugs: string[] = [];
  if (!(await fs.pathExists(baseDir))) return slugs;
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      slugs.push(...await collectSlugs(path.join(baseDir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name));
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      const slug = entry.name.replace(/\.(mdx?)$/, "");
      slugs.push(prefix ? `${prefix}/${slug}` : slug);
    }
  }
  return slugs;
}

/**
 * Resolve docs directory — supports both quick mode (docs/) and custom mode (src/content/docs/).
 */
function resolveDocsDir(root: string): string {
  const customMode = path.join(root, "src", "content", "docs");
  if (fs.existsSync(customMode)) return customMode;
  return path.join(root, "docs");
}

/**
 * Get all markdown files under docs/
 */
async function scanDocsFiles(docsDir: string): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();

  if (!(await fs.pathExists(docsDir))) {
    return result;
  }

  const locales = await fs.readdir(docsDir);
  for (const locale of locales) {
    const localeDir = path.join(docsDir, locale);
    const stat = await fs.stat(localeDir);
    if (!stat.isDirectory()) continue;

    const slugs = await collectSlugs(localeDir);
    result.set(locale, slugs);
  }

  return result;
}

/**
 * Extract navigation slugs from config per locale
 */
function getNavSlugs(config: any): Map<string, Set<string>> {
  const locales: string[] = config.i18n?.locales ?? ["en"];
  const result = new Map<string, Set<string>>();

  for (const locale of locales) {
    result.set(locale, new Set());
  }

  for (const group of config.navigation ?? []) {
    for (const page of group.pages ?? []) {
      for (const locale of locales) {
        result.get(locale)!.add(page);
      }
    }
  }

  return result;
}

/**
 * Parse YAML frontmatter from a markdown file (simple line-based parser).
 */
function parseFrontmatter(content: string): Record<string, unknown> | null {
  if (!content.startsWith("---")) return null;
  const end = content.indexOf("---", 3);
  if (end === -1) return null;
  const block = content.slice(3, end).trim();
  const result: Record<string, unknown> = {};
  for (const line of block.split("\n")) {
    const match = line.match(/^(\w[\w_]*):\s*(.*)/);
    if (!match) continue;
    const [, key, raw] = match;
    const value = raw.trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value.slice(1, -1).split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
    } else if (value === "true") {
      result[key] = true;
    } else if (value === "false") {
      result[key] = false;
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Check frontmatter of a markdown file
 */
async function checkFrontmatter(
  filePath: string
): Promise<string[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const missing: string[] = [];

  if (!content.startsWith("---")) {
    return missing;
  }

  const fm = parseFrontmatter(content);
  if (!fm) return missing;

  if (!fm.description) missing.push("description");

  return missing;
}

/**
 * Validate `related` links in frontmatter point to existing pages.
 */
async function checkRelatedLinks(
  docsDir: string,
  locales: string[],
  defaultLocale: string,
  navSlugs: Map<string, Set<string>>
): Promise<Array<{ filePath: string; slug: string; invalidRelated: string[] }>> {
  const issues: Array<{ filePath: string; slug: string; invalidRelated: string[] }> = [];
  const allSlugs = navSlugs.get(defaultLocale) ?? new Set();

  const defaultDir = path.join(docsDir, defaultLocale);
  if (!(await fs.pathExists(defaultDir))) return issues;

  const files = await fs.readdir(defaultDir);
  for (const file of files) {
    if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.(mdx?)$/, "");
    const filePath = path.join(defaultDir, file);
    const content = await fs.readFile(filePath, "utf-8");
    const fm = parseFrontmatter(content);
    if (!fm || !Array.isArray(fm.related)) continue;

    const invalid = (fm.related as string[]).filter((r) => !allSlugs.has(r));
    if (invalid.length > 0) {
      issues.push({ filePath: path.relative(path.dirname(docsDir), filePath), slug, invalidRelated: invalid });
    }
  }

  return issues;
}

export async function check(dir: string, options: CheckOptions): Promise<void> {
  const root = path.resolve(process.cwd(), dir);
  const { config } = await loadProjectConfig(root, options.config);

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc check")));
  console.log();

  const docsDir = resolveDocsDir(root);
  const locales: string[] = (config as any).i18n?.locales ?? ["en"];
  const defaultLocale: string = (config as any).i18n?.defaultLocale ?? "en";

  // Scan actual files
  const fileMap = await scanDocsFiles(docsDir);
  // Get nav slugs
  const navSlugs = getNavSlugs(config);

  const result: CheckResult = {
    missingFiles: [],
    orphanFiles: [],
    missingFrontmatter: [],
  };

  // Check: nav entries that have no corresponding file
  for (const locale of locales) {
    const slugsInNav = navSlugs.get(locale) ?? new Set();
    const filesOnDisk = new Set(fileMap.get(locale) ?? []);

    for (const slug of slugsInNav) {
      if (!filesOnDisk.has(slug)) {
        // Find group/page index for --fix
        let groupIndex = 0;
        let pageIndex = 0;
        const nav = (config as any).navigation ?? [];
        for (let gi = 0; gi < nav.length; gi++) {
          const pages = nav[gi].pages ?? [];
          const pi = pages.indexOf(slug);
          if (pi !== -1) {
            groupIndex = gi;
            pageIndex = pi;
            break;
          }
        }
        result.missingFiles.push({ slug, locale, groupIndex, pageIndex });
      }
    }
  }

  // Check: files on disk not referenced in navigation (orphans)
  for (const locale of locales) {
    const slugsInNav = navSlugs.get(locale) ?? new Set();
    const filesOnDisk = fileMap.get(locale) ?? [];

    for (const slug of filesOnDisk) {
      if (!slugsInNav.has(slug)) {
        const ext = (await fs.pathExists(path.join(docsDir, locale, `${slug}.mdx`)))
          ? ".mdx"
          : ".md";
        result.orphanFiles.push({
          slug,
          locale,
          filePath: path.join(docsDir, locale, `${slug}${ext}`),
        });
      }
    }
  }

  // Check: frontmatter on existing files (only default locale to avoid duplication)
  const defaultFiles = fileMap.get(defaultLocale) ?? [];
  for (const slug of defaultFiles) {
    const ext = (await fs.pathExists(path.join(docsDir, defaultLocale, `${slug}.mdx`)))
      ? ".mdx"
      : ".md";
    const filePath = path.join(docsDir, defaultLocale, `${slug}${ext}`);
    const missing = await checkFrontmatter(filePath);
    if (missing.length > 0) {
      result.missingFrontmatter.push({
        filePath: path.relative(root, filePath),
        fields: missing,
      });
    }
  }

  // Check: related links point to valid slugs
  const relatedIssues = await checkRelatedLinks(docsDir, locales, defaultLocale, navSlugs);

  // ── Report ────────────────────────────────────────────────────────────────

  let hasIssues = false;

  // Missing files (nav references non-existent files)
  if (result.missingFiles.length > 0) {
    hasIssues = true;
    console.log(pc.bold(pc.red(`  Missing files (${result.missingFiles.length})`)));
    console.log(pc.dim("  Navigation references files that don't exist on disk."));
    console.log();

    for (const item of result.missingFiles) {
      const ext = ".md";
      const relPath = `docs/${item.locale}/${item.slug}${ext}`;
      console.log(`  ${pc.red("✗")} ${pc.bold(item.slug)} ${pc.dim(`→ ${relPath}`)}`);
    }
    console.log();
  }

  // Orphan files (files not in navigation)
  if (result.orphanFiles.length > 0) {
    hasIssues = true;
    console.log(pc.bold(pc.yellow(`  Orphan files (${result.orphanFiles.length})`)));
    console.log(pc.dim("  Files exist on disk but are not referenced in navigation."));
    console.log();

    for (const item of result.orphanFiles) {
      const relPath = `docs/${item.locale}/${item.slug}`;
      console.log(
        `  ${pc.yellow("⚠")} ${pc.bold(item.slug)} ${pc.dim(`→ ${relPath}`)}`
      );
    }
    console.log();
  }

  // Missing frontmatter
  if (result.missingFrontmatter.length > 0) {
    console.log(pc.bold(pc.dim(`  Missing frontmatter fields (${result.missingFrontmatter.length})`)));
    console.log();

    for (const item of result.missingFrontmatter) {
      console.log(
        `  ${pc.dim("○")} ${item.filePath} ${pc.dim(`— missing: ${item.fields.join(", ")}`)}`
      );
    }
    console.log();
  }

  // Invalid related links
  if (relatedIssues.length > 0) {
    hasIssues = true;
    console.log(pc.bold(pc.yellow(`  Invalid related links (${relatedIssues.length})`)));
    console.log(pc.dim("  Frontmatter 'related' references slugs not in navigation."));
    console.log();

    for (const item of relatedIssues) {
      console.log(
        `  ${pc.yellow("⚠")} ${pc.bold(item.slug)} ${pc.dim(`→ invalid: ${item.invalidRelated.join(", ")}`)}`
      );
    }
    console.log();
  }

  // ── Auto-fix with --fix flag ───────────────────────────────────────────────

  if (options.fix && (result.missingFiles.length > 0 || result.orphanFiles.length > 0)) {
    console.log(pc.bold(pc.cyan("  Fixing issues...")));
    console.log();

    // Fix orphan files: add them to the last navigation group
    if (result.orphanFiles.length > 0) {
      const configPath = options.config
        ? path.resolve(root, options.config)
        : path.join(root, "barodoc.config.json");

      if (await fs.pathExists(configPath)) {
        const configJson = await fs.readJSON(configPath);
        const nav = configJson.navigation ?? [];

        // Group orphans by locale, but only add unique slugs (use default locale as source of truth)
        const defaultLocaleOrphans = result.orphanFiles.filter(
          (o) => o.locale === defaultLocale
        );

        if (defaultLocaleOrphans.length > 0) {
          if (nav.length === 0) {
            nav.push({ group: "Documentation", pages: [] });
          }

          for (const orphan of defaultLocaleOrphans) {
            const lastGroup = nav[nav.length - 1];
            if (!lastGroup.pages.includes(orphan.slug)) {
              lastGroup.pages.push(orphan.slug);
              console.log(
                `  ${pc.green("✓")} Added ${pc.bold(orphan.slug)} to navigation group "${lastGroup.group}"`
              );
            }
          }

          await fs.writeJSON(configPath, configJson, { spaces: 2 });
          console.log(pc.green("  ✓ Updated barodoc.config.json"));
        }
      } else {
        console.log(pc.yellow("  ⚠ Could not find barodoc.config.json to update navigation."));
      }
    }

    // Fix missing files: create stub markdown files
    if (result.missingFiles.length > 0) {
      for (const item of result.missingFiles) {
        const fileDir = path.join(docsDir, item.locale);
        await fs.ensureDir(fileDir);
        const filePath = path.join(fileDir, `${item.slug}.md`);

        const title = item.slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        await fs.writeFile(
          filePath,
          `---\ndescription: ${title}\n---\n\n# ${title}\n\nAdd your content here.\n`
        );
        console.log(`  ${pc.green("✓")} Created docs/${item.locale}/${item.slug}.md`);
      }
    }

    console.log();
    console.log(pc.bold("  Done! Run barodoc check again to verify."));
    console.log();
    return;
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  if (!hasIssues) {
    console.log(pc.green("  ✓ All good! No issues found."));
    console.log();
  } else {
    console.log(
      pc.dim(`  Run ${pc.cyan("barodoc check --fix")} to automatically fix missing/orphan files.`)
    );
    console.log();
    process.exit(1);
  }
}
