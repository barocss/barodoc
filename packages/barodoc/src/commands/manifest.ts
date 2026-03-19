import path from "path";
import pc from "picocolors";
import fs from "fs-extra";
import matter from "gray-matter";
import { loadProjectConfig } from "../runtime/project.js";

interface ManifestOptions {
  config?: string;
  output?: string;
  lite?: boolean;
  chunks?: boolean;
}

interface ManifestSection {
  heading: string;
  depth: number;
  content: string;
}

interface CodeExample {
  lang: string;
  code: string;
  section: string;
}

interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

interface ComponentAPI {
  name: string;
  props: ComponentProp[];
}

interface ManifestPage {
  slug: string;
  title: string;
  description: string;
  summary: string;
  category: string | null;
  locale: string;
  tags: string[];
  related: string[];
  difficulty: string | null;
  api_reference: boolean;
  headings: Array<{ depth: number; text: string }>;
  codeBlocks: Array<{ lang: string; lines: number }>;
  wordCount: number;
  filePath: string;
  sections?: ManifestSection[];
  codeExamples?: CodeExample[];
  componentAPI?: ComponentAPI;
}

interface DocsManifest {
  name: string;
  generatedAt: string;
  locales: string[];
  defaultLocale: string;
  pages: ManifestPage[];
  navigation: Array<{ group: string; pages: string[] }>;
}

interface Chunk {
  id: string;
  page_slug: string;
  section: string;
  locale: string;
  content: string;
  tokens_approx: number;
  tags: string[];
  difficulty: string | null;
  type: string;
}

// ── Extraction helpers ───────────────────────────────────────────────────────

function extractHeadings(content: string): Array<{ depth: number; text: string }> {
  const headings: Array<{ depth: number; text: string }> = [];
  const lines = content.split("\n");
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.startsWith("```")) { inCodeBlock = !inCodeBlock; continue; }
    if (inCodeBlock) continue;
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({ depth: match[1].length, text: match[2].trim() });
    }
  }
  return headings;
}

function extractCodeBlocksFull(content: string): Array<{ lang: string; code: string; lines: number }> {
  const blocks: Array<{ lang: string; code: string; lines: number }> = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    blocks.push({
      lang: m[1] || "text",
      code: m[2].trimEnd(),
      lines: m[2].split("\n").length - (m[2].endsWith("\n") ? 1 : 0),
    });
  }
  return blocks;
}

function extractSections(content: string): ManifestSection[] {
  const sections: ManifestSection[] = [];
  const lines = content.split("\n");
  let current: ManifestSection | null = null;
  let buffer: string[] = [];
  let inCodeBlock = false;

  function flush() {
    if (current) {
      current.content = buffer.join("\n").trim();
      if (current.content) sections.push(current);
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) inCodeBlock = !inCodeBlock;

    if (!inCodeBlock) {
      const match = line.match(/^(#{2,3})\s+(.+)/);
      if (match) {
        flush();
        current = { heading: match[2].trim(), depth: match[1].length, content: "" };
        buffer = [];
        continue;
      }
    }

    if (current) {
      buffer.push(line);
    } else if (!sections.length) {
      if (!current) {
        current = { heading: "(intro)", depth: 0, content: "" };
      }
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function extractSummary(content: string, description: string): string {
  if (description) return description;
  const stripped = content
    .replace(/^import\s+.*$/gm, "")
    .replace(/<[^>]+>/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#{1,6}\s+.*$/gm, "")
    .trim();
  const sentences = stripped.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 2).join(" ").trim().slice(0, 300);
}

function extractComponentAPI(content: string, slug: string): ComponentAPI | undefined {
  const props: ComponentProp[] = [];
  const paramRegex = /<ParamField\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/ParamField>)/g;
  let m;
  while ((m = paramRegex.exec(content)) !== null) {
    const attrs = m[1];
    const innerText = m[2]?.trim() || "";

    const nameMatch = attrs.match(/name=["']([^"']+)["']/);
    const typeMatch = attrs.match(/type=["']([^"']+)["']/);
    const defaultMatch = attrs.match(/default=["']([^"']+)["']/);
    const required = /\brequired\b/.test(attrs);

    if (nameMatch) {
      props.push({
        name: nameMatch[1],
        type: typeMatch?.[1] ?? "unknown",
        required,
        description: innerText.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
        ...(defaultMatch ? { default: defaultMatch[1] } : {}),
      });
    }
  }

  if (props.length === 0) return undefined;

  const name = slug.split("/").pop()!
    .split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  return { name, props };
}

function labelCodeExamples(content: string): CodeExample[] {
  const sections = extractSections(content);
  const examples: CodeExample[] = [];

  for (const section of sections) {
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    let m;
    while ((m = regex.exec(section.content)) !== null) {
      examples.push({
        lang: m[1] || "text",
        code: m[2].trimEnd(),
        section: section.heading,
      });
    }
  }
  return examples;
}

function countWords(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/[#*_~`\[\]()>|]/g, "");
  return stripped.split(/\s+/).filter((w) => w.length > 0).length;
}

function flatPages(pages: Array<string | { pages: string[] }>): string[] {
  const out: string[] = [];
  for (const entry of pages) {
    if (typeof entry === "string") out.push(entry);
    else out.push(...entry.pages);
  }
  return out;
}

function findCategory(slug: string, navigation: Array<{ group: string; pages: Array<string | { pages: string[] }> }>): string | null {
  for (const group of navigation) {
    if (flatPages(group.pages).includes(slug)) return group.group;
  }
  return null;
}

function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function slugToType(slug: string): string {
  if (slug.startsWith("components/")) return "component";
  if (slug.startsWith("guides/")) return "guide";
  return "page";
}

// ── Directory scan ───────────────────────────────────────────────────────────

async function scanDir(dir: string): Promise<string[]> {
  if (!(await fs.pathExists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let results: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await scanDir(full));
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      results.push(full);
    }
  }
  return results;
}

// ── Chunk generation ─────────────────────────────────────────────────────────

function generateChunks(pages: ManifestPage[]): Chunk[] {
  const chunks: Chunk[] = [];

  for (const page of pages) {
    if (!page.sections) continue;

    for (const section of page.sections) {
      const sectionId = section.heading
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const id = `${page.locale}/${page.slug}#${sectionId}`;
      const tokens = approxTokens(section.content);

      if (tokens <= 500 || section.depth >= 3) {
        chunks.push({
          id,
          page_slug: page.slug,
          section: section.heading,
          locale: page.locale,
          content: section.content,
          tokens_approx: tokens,
          tags: page.tags,
          difficulty: page.difficulty,
          type: slugToType(page.slug),
        });
      } else {
        const subSections = splitByH3(section.content, section.heading);
        for (const sub of subSections) {
          const subId = sub.heading
            .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          chunks.push({
            id: `${page.locale}/${page.slug}#${subId}`,
            page_slug: page.slug,
            section: sub.heading,
            locale: page.locale,
            content: sub.content,
            tokens_approx: approxTokens(sub.content),
            tags: page.tags,
            difficulty: page.difficulty,
            type: slugToType(page.slug),
          });
        }
      }
    }
  }

  return chunks;
}

function splitByH3(content: string, parentHeading: string): Array<{ heading: string; content: string }> {
  const parts: Array<{ heading: string; content: string }> = [];
  const lines = content.split("\n");
  let current = { heading: parentHeading, content: "" };
  let buffer: string[] = [];
  let inCode = false;

  function flush() {
    current.content = buffer.join("\n").trim();
    if (current.content) parts.push({ ...current });
  }

  for (const line of lines) {
    if (line.startsWith("```")) inCode = !inCode;
    if (!inCode) {
      const match = line.match(/^###\s+(.+)/);
      if (match) {
        flush();
        current = { heading: match[1].trim(), content: "" };
        buffer = [];
        continue;
      }
    }
    buffer.push(line);
  }
  flush();
  return parts;
}

// ── Main command ─────────────────────────────────────────────────────────────

export async function manifest(dir: string, options: ManifestOptions): Promise<void> {
  const root = path.resolve(process.cwd(), dir);
  const { config } = await loadProjectConfig(root, options.config);
  const isLite = options.lite === true;
  const emitChunks = options.chunks === true;

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc manifest")));
  if (isLite) console.log(pc.dim("  (lite mode — metadata only)"));
  console.log();

  const customModeDir = path.join(root, "src", "content", "docs");
  const quickModeDir = path.join(root, "docs");
  const docsDir = fs.existsSync(customModeDir) ? customModeDir : quickModeDir;
  const locales: string[] = (config as any).i18n?.locales ?? ["en"];
  const defaultLocale: string = (config as any).i18n?.defaultLocale ?? "en";
  const navigation: Array<{ group: string; pages: string[] }> = (config as any).navigation ?? [];

  const pages: ManifestPage[] = [];

  for (const locale of locales) {
    const localeDir = path.join(docsDir, locale);
    const files = await scanDir(localeDir);

    for (const filePath of files) {
      const raw = await fs.readFile(filePath, "utf-8");
      const { data: fm, content } = matter(raw);

      const relPath = path.relative(localeDir, filePath);
      const slug = relPath.replace(/\.(mdx?)$/, "").replace(/\\/g, "/");

      const title = fm.title
        || extractHeadings(content).find((h) => h.depth === 1)?.text
        || slug.split("/").pop()!.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

      const codeBlocksFull = extractCodeBlocksFull(content);

      const page: ManifestPage = {
        slug,
        title,
        description: fm.description ?? "",
        summary: extractSummary(content, fm.description ?? ""),
        category: fm.category ?? findCategory(slug, navigation),
        locale,
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        related: Array.isArray(fm.related) ? fm.related : [],
        difficulty: fm.difficulty ?? null,
        api_reference: fm.api_reference === true,
        headings: extractHeadings(content),
        codeBlocks: codeBlocksFull.map((b) => ({ lang: b.lang, lines: b.lines })),
        wordCount: countWords(raw),
        filePath: `${locale}/${relPath}`,
      };

      if (!isLite) {
        page.sections = extractSections(content);
        page.codeExamples = labelCodeExamples(content);
        const api = extractComponentAPI(content, slug);
        if (api) page.componentAPI = api;
      }

      pages.push(page);
    }
  }

  const result: DocsManifest = {
    name: (config as any).name ?? "Docs",
    generatedAt: new Date().toISOString(),
    locales,
    defaultLocale,
    pages,
    navigation: navigation.map((g) => ({ group: g.group, pages: g.pages })),
  };

  const outPath = options.output
    ? path.resolve(root, options.output)
    : path.join(root, "docs-manifest.json");

  await fs.writeJSON(outPath, result, { spaces: 2 });

  console.log(pc.green(`  ✓ Generated ${path.relative(root, outPath)}`));
  console.log(pc.dim(`    ${pages.length} pages across ${locales.length} locale(s)`));

  if (emitChunks) {
    const chunks = generateChunks(pages);
    const chunksPath = outPath.replace(/\.json$/, "") + "-chunks.jsonl";
    const jsonl = chunks.map((c) => JSON.stringify(c)).join("\n");
    await fs.writeFile(chunksPath, jsonl, "utf-8");
    console.log(pc.green(`  ✓ Generated ${path.relative(root, chunksPath)}`));
    console.log(pc.dim(`    ${chunks.length} chunks`));
  }

  console.log();
}
