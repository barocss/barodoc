import type { Root } from "mdast";
import type { Plugin } from "unified";
import { findAndReplace } from "mdast-util-find-and-replace";
import type { ResolvedBarodocConfig } from "@barodoc/core";
import {
  buildWikiIndex,
  parseWikiInner,
  pathToDocContext,
  resolveWikiLink,
  type WikiIndex,
} from "./wikiIndex.js";

const WIKI_RE = /\[\[([^\]\n]+)\]\]/g;

export interface RemarkWikiLinkOptions {
  /** Absolute project root (contains src/content). */
  projectRoot: string;
  config: ResolvedBarodocConfig;
  /**
   * Optional shared index (e.g. updated by Vite watch). If omitted, built lazily per process.
   */
  getWikiIndex?: () => WikiIndex;
}

function getSectionSlugs(config: ResolvedBarodocConfig): string[] {
  return ["docs", ...(config.sections?.map((s) => s.slug) ?? [])];
}

/**
 * Remark plugin: turns [[wikilinks]] into standard mdast links (Obsidian-style).
 */
export function remarkWikiLink(
  options: RemarkWikiLinkOptions,
): Plugin<[], Root, Root> {
  const { projectRoot, config } = options;
  const locales = config.i18n?.locales ?? ["en"];
  const defaultLocale = config.i18n?.defaultLocale ?? "en";
  const sectionSlugs = getSectionSlugs(config);

  let lazyIndex: WikiIndex | null = null;
  function index(): WikiIndex {
    if (options.getWikiIndex) return options.getWikiIndex();
    if (!lazyIndex) {
      lazyIndex = buildWikiIndex(projectRoot, config);
    }
    return lazyIndex;
  }

  return function attacher() {
    return function transformer(tree: Root, file: { path?: string }) {
      const filePath = file.path;
      if (!filePath) return;

      const ctx = pathToDocContext(filePath, projectRoot, sectionSlugs);
      if (!ctx) return;

      findAndReplace(tree, [
        [
          WIKI_RE,
          (full: string, inner: string) => {
            void full;
            const { path: rawPath, alias } = parseWikiInner(inner);
            if (!rawPath) return false;

            const resolved = resolveWikiLink(
              rawPath,
              alias,
              ctx.docId,
              ctx.sectionSlug,
              index(),
              locales,
              defaultLocale,
            );

            if (!resolved) {
              return false;
            }

            return {
              type: "link",
              url: resolved.href,
              children: [{ type: "text", value: resolved.label }],
            };
          },
        ],
      ]);
    };
  };
}

/**
 * Invalidate lazy index (call from Vite when content files change).
 */
export function createWikiIndexCache() {
  let cache: WikiIndex | null = null;
  return {
    get: (projectRoot: string, config: ResolvedBarodocConfig) => {
      if (!cache) {
        cache = buildWikiIndex(projectRoot, config);
      }
      return cache;
    },
    invalidate: () => {
      cache = null;
    },
  };
}
