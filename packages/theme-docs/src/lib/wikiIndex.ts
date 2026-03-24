/**
 * Build-time wiki link index: maps doc ids (Astro content collection ids) to site paths.
 */
import fs from "node:fs";
import path from "node:path";
import type { ResolvedBarodocConfig } from "@barodoc/core";

export interface WikiPage {
  sectionSlug: string;
  /** Content collection id, e.g. `ko/guides/landing` */
  docId: string;
  /** Site path, e.g. `/docs/ko/guides/landing` */
  href: string;
  basename: string;
}

export interface WikiIndex {
  /** docId → page */
  byDocId: Map<string, WikiPage>;
  /**
   * locale → basename → single docId, or list if ambiguous (same basename in multiple folders).
   */
  byLocaleBasename: Map<string, Map<string, string | string[]>>;
}

function docIdToHref(
  sectionSlug: string,
  docId: string,
  defaultLocale: string,
  locales: string[],
): string {
  const parts = docId.split("/");
  const hasLocale = locales.includes(parts[0] ?? "");
  let locale = defaultLocale;
  let cleanSlug = docId;
  if (hasLocale) {
    locale = parts[0]!;
    cleanSlug = parts.slice(1).join("/");
  }
  const innerPath =
    locale === defaultLocale ? cleanSlug : `${locale}/${cleanSlug}`;
  return `/${sectionSlug}/${innerPath}`;
}

function walkMdFiles(dir: string, base: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      walkMdFiles(full, base, out);
    } else if (/\.(md|mdx)$/i.test(name)) {
      out.push(path.relative(base, full).replace(/\\/g, "/"));
    }
  }
}

function addBasenameEntry(
  byLocaleBasename: Map<string, Map<string, string | string[]>>,
  locale: string,
  basename: string,
  docId: string,
): void {
  if (!byLocaleBasename.has(locale)) {
    byLocaleBasename.set(locale, new Map());
  }
  const m = byLocaleBasename.get(locale)!;
  const prev = m.get(basename);
  if (prev === undefined) {
    m.set(basename, docId);
  } else if (typeof prev === "string") {
    if (prev !== docId) m.set(basename, [prev, docId]);
  } else {
    const set = new Set(prev);
    set.add(docId);
    m.set(basename, [...set]);
  }
}

/**
 * Collect all wiki-navigable pages under src/content (per section), all .md / .mdx files.
 */
export function buildWikiIndex(
  projectRoot: string,
  config: ResolvedBarodocConfig,
): WikiIndex {
  const defaultLocale = config.i18n?.defaultLocale ?? "en";
  const locales = config.i18n?.locales ?? ["en"];

  const sectionSlugs = [
    "docs",
    ...(config.sections?.map((s) => s.slug) ?? []),
  ];

  const byDocId = new Map<string, WikiPage>();
  const byLocaleBasename = new Map<string, Map<string, string | string[]>>();

  const contentRoot = path.join(projectRoot, "src", "content");

  for (const sectionSlug of sectionSlugs) {
    const sectionDir = path.join(contentRoot, sectionSlug);
    const relFiles: string[] = [];
    walkMdFiles(sectionDir, sectionDir, relFiles);

    for (const rel of relFiles) {
      const docId = rel.replace(/\.(md|mdx)$/i, "");
      const href = docIdToHref(sectionSlug, docId, defaultLocale, locales);
      const basename = docId.includes("/")
        ? docId.slice(docId.lastIndexOf("/") + 1)
        : docId;

      const parts = docId.split("/");
      const hasLocale = locales.includes(parts[0] ?? "");
      const locale = hasLocale ? parts[0]! : defaultLocale;

      const page: WikiPage = { sectionSlug, docId, href, basename };
      byDocId.set(docId, page);

      addBasenameEntry(byLocaleBasename, locale, basename, docId);
    }
  }

  return { byDocId, byLocaleBasename };
}

function dirname(docId: string): string {
  const i = docId.lastIndexOf("/");
  return i === -1 ? "" : docId.slice(0, i);
}

/**
 * Strip Obsidian-style .md suffix if present.
 */
export function normalizeWikiTarget(raw: string): string {
  let t = raw.trim();
  if (t.toLowerCase().endsWith(".md")) t = t.slice(0, -3);
  if (t.toLowerCase().endsWith(".mdx")) t = t.slice(0, -4);
  return t;
}

export interface ResolvedWikiLink {
  href: string;
  label: string;
}

/**
 * Resolve [[target]] / [[target|label]] within the same content section as the source file.
 */
export function resolveWikiLink(
  linkPath: string,
  alias: string | undefined,
  fromDocId: string,
  fromSectionSlug: string,
  index: WikiIndex,
  locales: string[],
  defaultLocale: string,
): ResolvedWikiLink | null {
  const full = normalizeWikiTarget(linkPath);
  const hashIdx = full.indexOf("#");
  const pathPart = hashIdx >= 0 ? full.slice(0, hashIdx) : full;
  const fragment = hashIdx >= 0 ? full.slice(hashIdx + 1) : "";

  const fromParts = fromDocId.split("/");
  const fromHasLocale = locales.includes(fromParts[0] ?? "");
  const fromLocale = fromHasLocale ? fromParts[0]! : defaultLocale;

  const candidates: string[] = [];

  if (pathPart.includes("/")) {
    const seg0 = pathPart.split("/")[0] ?? "";
    if (locales.includes(seg0)) {
      candidates.push(pathPart);
    } else {
      candidates.push(`${fromLocale}/${pathPart}`);
    }
  } else if (pathPart.length > 0) {
    const dir = dirname(fromDocId);
    if (dir) {
      candidates.push(`${dir}/${pathPart}`);
    }
    candidates.push(`${fromLocale}/${pathPart}`);
  } else {
    return null;
  }

  let resolvedId: string | undefined;
  for (const id of candidates) {
    if (index.byDocId.has(id)) {
      resolvedId = id;
      break;
    }
  }

  if (!resolvedId) {
    const map = index.byLocaleBasename.get(fromLocale);
    const bare = pathPart.includes("/")
      ? pathPart.slice(pathPart.lastIndexOf("/") + 1)
      : pathPart;
    const entry = map?.get(bare);
    if (typeof entry === "string") {
      resolvedId = entry;
    } else if (Array.isArray(entry) && entry.length === 1) {
      resolvedId = entry[0];
    }
  }

  if (!resolvedId) return null;

  const page = index.byDocId.get(resolvedId);
  if (!page || page.sectionSlug !== fromSectionSlug) return null;

  let href = page.href;
  if (fragment) {
    const slug = slugifyHeading(fragment);
    href = `${href}#${slug}`;
  }

  const label =
    alias?.trim() ||
    page.basename.replace(/-/g, " ");

  return { href, label };
}

/** GitHub-style heading slug (ASCII-ish); good enough for #fragments in MDX. */
function slugifyHeading(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Parse `[[page]]` or `[[page|alias]]` or `[[page#Heading]]` inner string.
 */
export function parseWikiInner(inner: string): {
  path: string;
  alias?: string;
} {
  const trimmed = inner.trim();
  const pipe = trimmed.indexOf("|");
  if (pipe === -1) {
    return { path: trimmed };
  }
  return {
    path: trimmed.slice(0, pipe).trim(),
    alias: trimmed.slice(pipe + 1).trim() || undefined,
  };
}

/**
 * From absolute filesystem path to content file, derive section slug and doc id.
 * Example: .../src/content/docs/ko/guides/landing.mdx → docs, ko/guides/landing
 */
export function pathToDocContext(
  filePath: string,
  projectRoot: string,
  sectionSlugs: string[],
): { sectionSlug: string; docId: string } | null {
  const norm = filePath.replace(/\\/g, "/");
  const root = projectRoot.replace(/\\/g, "/");
  const marker = "/src/content/";
  const idx = norm.indexOf(marker);
  if (idx === -1) return null;
  const rest = norm.slice(idx + marker.length);
  const slash = rest.indexOf("/");
  if (slash === -1) return null;
  const sectionSlug = rest.slice(0, slash);
  if (!sectionSlugs.includes(sectionSlug)) return null;
  let rel = rest.slice(slash + 1);
  rel = rel.replace(/\.(md|mdx)$/i, "");
  return { sectionSlug, docId: rel };
}
