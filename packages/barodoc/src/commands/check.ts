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
 * Get all markdown files under docs/
 */
async function scanDocsFiles(docsDir: string): Promise<Map<string, string[]>> {
  // locale -> slugs
  const result = new Map<string, string[]>();

  if (!(await fs.pathExists(docsDir))) {
    return result;
  }

  const locales = await fs.readdir(docsDir);
  for (const locale of locales) {
    const localeDir = path.join(docsDir, locale);
    const stat = await fs.stat(localeDir);
    if (!stat.isDirectory()) continue;

    const slugs: string[] = [];
    const files = await fs.readdir(localeDir);
    for (const file of files) {
      if (file.endsWith(".md") || file.endsWith(".mdx")) {
        slugs.push(file.replace(/\.(mdx?)$/, ""));
      }
    }
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
 * Check frontmatter of a markdown file
 */
async function checkFrontmatter(
  filePath: string
): Promise<string[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const missing: string[] = [];

  // Check if frontmatter exists at all
  if (!content.startsWith("---")) {
    // No frontmatter - but not required for barodoc (title can come from # heading)
    return missing;
  }

  const end = content.indexOf("---", 3);
  if (end === -1) return missing;

  const frontmatter = content.slice(3, end);

  // Check for description (recommended but not required)
  if (!frontmatter.includes("description:")) {
    missing.push("description");
  }

  return missing;
}

export async function check(dir: string, options: CheckOptions): Promise<void> {
  const root = path.resolve(process.cwd(), dir);
  const { config } = await loadProjectConfig(root, options.config);

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc check")));
  console.log();

  const docsDir = path.join(root, "docs");
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
