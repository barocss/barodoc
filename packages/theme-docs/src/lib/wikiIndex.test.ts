import { describe, expect, it } from "vitest";
import {
  buildWikiIndex,
  parseWikiInner,
  resolveWikiLink,
  pathToDocContext,
} from "./wikiIndex.js";
import type { ResolvedBarodocConfig } from "@barodoc/core";

const mockConfig = {
  name: "Test",
  navigation: [],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ko"],
  },
  _resolved: true as const,
  _configPath: "",
} satisfies ResolvedBarodocConfig;

function makeIndex(): ReturnType<typeof buildWikiIndex> {
  const byDocId = new Map([
    [
      "ko/guides/landing",
      {
        sectionSlug: "docs",
        docId: "ko/guides/landing",
        href: "/docs/ko/guides/landing",
        basename: "landing",
      },
    ],
    [
      "ko/guides/i18n",
      {
        sectionSlug: "docs",
        docId: "ko/guides/i18n",
        href: "/docs/ko/guides/i18n",
        basename: "i18n",
      },
    ],
    [
      "en/guides/landing",
      {
        sectionSlug: "docs",
        docId: "en/guides/landing",
        href: "/docs/guides/landing",
        basename: "landing",
      },
    ],
  ]);
  const byLocaleBasename = new Map<string, Map<string, string | string[]>>();
  const koMap = new Map<string, string | string[]>([
    ["landing", "ko/guides/landing"],
    ["i18n", "ko/guides/i18n"],
  ]);
  byLocaleBasename.set("ko", koMap);
  return { byDocId, byLocaleBasename };
}

describe("parseWikiInner", () => {
  it("parses path and alias", () => {
    expect(parseWikiInner("foo|Bar")).toEqual({ path: "foo", alias: "Bar" });
  });
  it("parses path only", () => {
    expect(parseWikiInner("foo#baz")).toEqual({ path: "foo#baz" });
  });
});

describe("pathToDocContext", () => {
  it("extracts section and doc id", () => {
    const root = "/project";
    const p = "/project/src/content/docs/ko/guides/landing.mdx";
    expect(pathToDocContext(p, root, ["docs", "help"])).toEqual({
      sectionSlug: "docs",
      docId: "ko/guides/landing",
    });
  });
});

describe("resolveWikiLink", () => {
  const index = makeIndex();

  it("resolves same-folder bare name", () => {
    const r = resolveWikiLink(
      "i18n",
      undefined,
      "ko/guides/landing",
      "docs",
      index,
      ["en", "ko"],
      "en",
    );
    expect(r?.href).toBe("/docs/ko/guides/i18n");
  });

  it("resolves path under locale", () => {
    const r = resolveWikiLink(
      "guides/i18n",
      undefined,
      "ko/guides/landing",
      "docs",
      index,
      ["en", "ko"],
      "en",
    );
    expect(r?.href).toBe("/docs/ko/guides/i18n");
  });

  it("resolves alias", () => {
    const r = resolveWikiLink(
      "i18n",
      "다국어",
      "ko/guides/landing",
      "docs",
      index,
      ["en", "ko"],
      "en",
    );
    expect(r?.label).toBe("다국어");
  });

  it("adds heading fragment", () => {
    const r = resolveWikiLink(
      "i18n#설정",
      undefined,
      "ko/guides/landing",
      "docs",
      index,
      ["en", "ko"],
      "en",
    );
    expect(r?.href).toContain("#");
    expect(r?.href.startsWith("/docs/ko/guides/i18n#")).toBe(true);
  });
});

describe("buildWikiIndex", () => {
  it("indexes docs site fixture when run from repo", () => {
    const idx = buildWikiIndex(
      new URL("../../../../docs", import.meta.url).pathname,
      mockConfig,
    );
    expect(idx.byDocId.size).toBeGreaterThan(10);
    expect(idx.byDocId.has("ko/guides/landing")).toBe(true);
  });
});
