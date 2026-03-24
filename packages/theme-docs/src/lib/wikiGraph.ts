/**
 * Wiki link graph: nodes = pages, edges = [[wikilinks]] and internal Markdown links.
 */
import fs from "node:fs";
import path from "node:path";
import type { ResolvedBarodocConfig } from "@barodoc/core";
import {
  buildWikiIndex,
  parseWikiInner,
  resolveWikiLink,
  type WikiIndex,
} from "./wikiIndex.js";

const WIKI_RE = /\[\[([^\]\n]+)\]\]/g;
/** Markdown links `[label](href)` — images `![...](...)` stripped before matching. */
const MD_LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;
/** MDX/HTML `<a href="...">` */
const A_HREF_RE = /<a\b[^>]*\bhref\s*=\s*(["'])([^"']+)\1/gi;

export interface WikiGraphNode {
  id: string;
  title: string;
  href: string;
  sectionSlug: string;
}

export interface WikiGraphEdge {
  from: string;
  to: string;
}

export interface WikiGraphBroken {
  from: string;
  kind: "wikilink" | "mdlink" | "anchor";
  /** Raw inner `[[...]]`, href string, etc. */
  raw: string;
}

export interface WikiGraphJson {
  version: 1;
  generatedAt: string;
  site?: string;
  nodes: WikiGraphNode[];
  edges: WikiGraphEdge[];
  /** Internal-looking links that did not resolve to a page */
  broken?: WikiGraphBroken[];
}

/** Dedupe graph nodes by id, sort by title (for Linked pages lists). */
export function sortDedupeDocLinks(
  nodes: WikiGraphNode[],
): { title: string; href: string }[] {
  const seen = new Set<string>();
  const out: WikiGraphNode[] = [];
  for (const n of nodes) {
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    out.push(n);
  }
  out.sort((a, b) => a.title.localeCompare(b.title));
  return out.map((n) => ({ title: n.title, href: n.href }));
}

function stripFencedCode(raw: string): string {
  return raw.replace(/```[\s\S]*?```/g, " ");
}

/** Inline `` `...` `` — not real links (docs often show `[[page|Label]]` as examples). */
function stripInlineCode(raw: string): string {
  return raw.replace(/`[^`]*`/g, " ");
}

function stripCodeSpans(raw: string): string {
  return stripInlineCode(stripFencedCode(raw));
}

function extractTitle(raw: string): string | null {
  if (!raw.startsWith("---")) return null;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return null;
  const fm = raw.slice(3, end);
  const m = fm.match(/^title:\s*["']?([^"'\n]+)["']?/m);
  return m?.[1]?.trim() ?? null;
}

function fsPathForDoc(
  projectRoot: string,
  sectionSlug: string,
  docId: string,
): string | null {
  const rel = path.join(...docId.split("/"));
  const base = path.join(projectRoot, "src", "content", sectionSlug, rel);
  for (const ext of [".mdx", ".md"]) {
    const p = base + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

function extractWikilinksFromFile(raw: string): string[] {
  const body = stripCodeSpans(raw);
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(WIKI_RE.source, "g");
  while ((m = re.exec(body)) !== null) {
    out.push(m[1]!.trim());
  }
  return out;
}

function extractMarkdownLinkHrefs(raw: string): string[] {
  const body = stripCodeSpans(raw);
  const withoutImages = body.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(MD_LINK_RE.source, "g");
  while ((m = re.exec(withoutImages)) !== null) {
    out.push(m[1]!.trim());
  }
  return out;
}

function extractAnchorHrefs(raw: string): string[] {
  const body = stripCodeSpans(raw);
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(A_HREF_RE.source, "gi");
  while ((m = re.exec(body)) !== null) {
    out.push(m[2]!.trim());
  }
  return out;
}

/** True if a failed resolution is worth reporting (skip obvious external URLs). */
export function hrefLooksLikeInternalLink(
  href: string,
  config: ResolvedBarodocConfig,
): boolean {
  const h = stripHashAndQuery(href);
  if (!h) return false;
  if (/^(mailto:|tel:|javascript:)/i.test(h)) return false;
  if (/^https?:\/\//i.test(h)) {
    const site = config.site?.replace(/\/$/, "");
    if (!site) return false;
    try {
      const origin = new URL(site.endsWith("/") ? site : `${site}/`);
      const u = new URL(h);
      return u.origin === origin.origin;
    } catch {
      return false;
    }
  }
  return true;
}

function stripHashAndQuery(href: string): string {
  let s = href.trim();
  const q = s.indexOf("?");
  if (q >= 0) s = s.slice(0, q);
  const hash = s.indexOf("#");
  if (hash >= 0) s = s.slice(0, hash);
  return s.trim();
}

function stripMdExtension(id: string): string {
  return id.replace(/\.(md|mdx)$/i, "");
}

function sectionSlugsFromConfig(config: ResolvedBarodocConfig): string[] {
  return ["docs", ...(config.sections?.map((s) => s.slug) ?? [])];
}

/**
 * Normalize `{locale}/docs/...` → `/docs/{locale}/...` (same URLs as `docIdToHref`).
 */
export function normalizeLegacyLocaleDocsPath(pathname: string): string {
  return pathname.replace(
    /^\/(en|ko)\/docs(\/.*)?$/i,
    (_, loc: string, rest: string | undefined) =>
      `/docs/${loc.toLowerCase()}${rest ?? ""}`,
  );
}

function stripBasePath(pathname: string, basePath: string): string {
  let p = pathname.replace(/\/$/, "") || "/";
  const b = basePath.replace(/\/$/, "");
  if (b && b !== "/" && p.startsWith(b)) {
    p = p.slice(b.length) || "/";
  }
  return p;
}

/**
 * Map a site pathname like `/docs/ko/guides/landing` or default-locale `/docs/guides/landing`
 * to a content doc id (`ko/guides/landing`, `en/guides/landing`).
 */
function pathnameToDocId(
  pathname: string,
  index: WikiIndex,
  sectionSlugs: string[],
  basePath: string,
  defaultLocale: string,
  locales: string[],
): string | null {
  let p = stripBasePath(normalizeLegacyLocaleDocsPath(pathname), basePath);
  const parts = p.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const section = parts[0];
  if (!sectionSlugs.includes(section)) return null;
  const rest = parts.slice(1);
  if (rest.length === 0) return null;

  const candidates: string[] = [];
  if (locales.includes(rest[0]!)) {
    candidates.push(stripMdExtension(rest.join("/")));
  } else {
    candidates.push(stripMdExtension(`${defaultLocale}/${rest.join("/")}`));
    candidates.push(stripMdExtension(rest.join("/")));
  }

  for (const id of candidates) {
    if (index.byDocId.has(id)) return id;
  }
  return null;
}

/** True if pathname targets a configured content section (docs, help, …). */
function pathnameTargetsContentSection(
  pathname: string,
  config: ResolvedBarodocConfig,
): boolean {
  const basePath = config.base?.replace(/\/$/, "") ?? "";
  let p = stripBasePath(normalizeLegacyLocaleDocsPath(pathname), basePath);
  const parts = p.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  return sectionSlugsFromConfig(config).includes(parts[0]!);
}

/**
 * Only report unresolved links that plausibly point at indexed content (not `/pricing`, `/yaml-landing-demo`, …).
 * Relative `href`s are always candidates.
 */
export function shouldReportUnresolvedWikiHref(
  href: string,
  config: ResolvedBarodocConfig,
): boolean {
  if (!hrefLooksLikeInternalLink(href, config)) return false;
  const h = stripHashAndQuery(href);
  if (!h.startsWith("/") && !/^https?:\/\//i.test(h)) {
    return true;
  }
  const site = config.site?.replace(/\/$/, "");
  let pathname = h;
  if (/^https?:\/\//i.test(h)) {
    if (!site) return false;
    try {
      const origin = new URL(site.endsWith("/") ? site : `${site}/`);
      const u = new URL(h);
      if (u.origin !== origin.origin) return false;
      pathname = u.pathname;
    } catch {
      return false;
    }
  }
  return pathnameTargetsContentSection(pathname, config);
}

/**
 * Resolve a Markdown `href` to a target doc id if it points at indexed content.
 */
export function resolveMarkdownHrefToDocId(
  href: string,
  fromDocId: string,
  index: WikiIndex,
  config: ResolvedBarodocConfig,
): string | null {
  const h = stripHashAndQuery(href);
  if (!h) return null;
  if (/^(mailto:|tel:|javascript:)/i.test(h)) return null;

  const sectionSlugs = sectionSlugsFromConfig(config);
  const site = config.site?.replace(/\/$/, "");
  const basePath = config.base?.replace(/\/$/, "") ?? "";
  const defaultLocale = config.i18n?.defaultLocale ?? "en";
  const locales = config.i18n?.locales ?? ["en"];

  if (/^https?:\/\//i.test(h)) {
    if (!site) return null;
    try {
      const origin = new URL(site.endsWith("/") ? site : `${site}/`);
      const u = new URL(h);
      if (u.origin !== origin.origin) return null;
      return pathnameToDocId(
        u.pathname,
        index,
        sectionSlugs,
        basePath,
        defaultLocale,
        locales,
      );
    } catch {
      return null;
    }
  }

  if (h.startsWith("/")) {
    return pathnameToDocId(
      h,
      index,
      sectionSlugs,
      basePath,
      defaultLocale,
      locales,
    );
  }

  const parent = path.posix.dirname(fromDocId);
  const joined = stripMdExtension(
    path.posix.normalize(path.posix.join(parent, h)),
  );
  if (index.byDocId.has(joined)) return joined;
  return null;
}

function addEdge(
  from: string,
  to: string,
  edgeKeys: Set<string>,
  edges: WikiGraphEdge[],
): void {
  if (to === from) return;
  const key = `${from}\0${to}`;
  if (edgeKeys.has(key)) return;
  edgeKeys.add(key);
  edges.push({ from, to });
}

export function buildWikiGraph(
  projectRoot: string,
  config: ResolvedBarodocConfig,
): WikiGraphJson {
  const index = buildWikiIndex(projectRoot, config);
  const defaultLocale = config.i18n?.defaultLocale ?? "en";
  const locales = config.i18n?.locales ?? ["en"];
  const site = config.site;

  const nodes: WikiGraphNode[] = [];
  const edgeKeys = new Set<string>();
  const edges: WikiGraphEdge[] = [];
  const brokenKey = new Set<string>();
  const broken: WikiGraphBroken[] = [];

  function addBroken(
    from: string,
    kind: WikiGraphBroken["kind"],
    raw: string,
  ): void {
    const k = `${from}\0${kind}\0${raw}`;
    if (brokenKey.has(k)) return;
    brokenKey.add(k);
    broken.push({ from, kind, raw });
  }

  for (const [docId, page] of index.byDocId) {
    const fsPath = fsPathForDoc(projectRoot, page.sectionSlug, docId);
    let title = page.basename.replace(/-/g, " ");
    if (fsPath) {
      try {
        const raw = fs.readFileSync(fsPath, "utf-8");
        const t = extractTitle(raw);
        if (t) title = t;
      } catch {
        /* keep basename title */
      }
    }
    nodes.push({
      id: docId,
      title,
      href: page.href,
      sectionSlug: page.sectionSlug,
    });
  }

  for (const [docId, page] of index.byDocId) {
    const fsPath = fsPathForDoc(projectRoot, page.sectionSlug, docId);
    if (!fsPath) continue;
    let raw: string;
    try {
      raw = fs.readFileSync(fsPath, "utf-8");
    } catch {
      continue;
    }
    const inners = extractWikilinksFromFile(raw);
    for (const inner of inners) {
      const { path: rawPath } = parseWikiInner(inner);
      if (!rawPath.trim()) continue;

      const resolved = resolveWikiLink(
        rawPath.trim(),
        undefined,
        docId,
        page.sectionSlug,
        index,
        locales,
        defaultLocale,
      );
      if (!resolved) {
        addBroken(docId, "wikilink", inner);
        continue;
      }

      const hrefBase = resolved.href.replace(/#.*$/, "");
      let toId: string | undefined;
      for (const [id, p] of index.byDocId) {
        if (p.href === hrefBase) {
          toId = id;
          break;
        }
      }
      if (!toId) continue;
      addEdge(docId, toId, edgeKeys, edges);
    }

    const mdHrefs = extractMarkdownLinkHrefs(raw);
    for (const href of mdHrefs) {
      const toId = resolveMarkdownHrefToDocId(href, docId, index, config);
      if (!toId) {
        if (shouldReportUnresolvedWikiHref(href, config)) {
          addBroken(docId, "mdlink", href);
        }
        continue;
      }
      addEdge(docId, toId, edgeKeys, edges);
    }

    const anchorHrefs = extractAnchorHrefs(raw);
    for (const href of anchorHrefs) {
      const toId = resolveMarkdownHrefToDocId(href, docId, index, config);
      if (!toId) {
        if (shouldReportUnresolvedWikiHref(href, config)) {
          addBroken(docId, "anchor", href);
        }
        continue;
      }
      addEdge(docId, toId, edgeKeys, edges);
    }
  }

  nodes.sort((a, b) => a.id.localeCompare(b.id));

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    site: site?.replace(/\/$/, ""),
    nodes,
    edges,
    broken: broken.length > 0 ? broken : undefined,
  };
}

export function writeWikiGraphJson(
  projectRoot: string,
  config: ResolvedBarodocConfig,
  outFile: string,
): void {
  const data = buildWikiGraph(projectRoot, config);
  const dir = path.dirname(outFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2), "utf-8");
}
