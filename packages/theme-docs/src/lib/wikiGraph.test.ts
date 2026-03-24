import { describe, expect, it } from "vitest";
import {
  buildWikiGraph,
  hrefLooksLikeInternalLink,
  normalizeLegacyLocaleDocsPath,
  resolveMarkdownHrefToDocId,
  shouldReportUnresolvedWikiHref,
} from "./wikiGraph.js";
import { buildWikiIndex } from "./wikiIndex.js";
import type { ResolvedBarodocConfig } from "@barodoc/core";

const mockConfig = {
  name: "Test",
  navigation: [],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ko"],
  },
  site: "https://barodoc.dev",
  _resolved: true as const,
  _configPath: "",
} satisfies ResolvedBarodocConfig;

describe("buildWikiGraph", () => {
  it("produces nodes and edges from docs fixture", () => {
    const root = new URL("../../../../docs", import.meta.url).pathname;
    const g = buildWikiGraph(root, mockConfig);
    expect(g.version).toBe(1);
    expect(g.nodes.length).toBeGreaterThan(0);
    expect(Array.isArray(g.edges)).toBe(true);
  });
});

describe("resolveMarkdownHrefToDocId", () => {
  const root = new URL("../../../../docs", import.meta.url).pathname;

  it("resolves absolute site path", () => {
    const index = buildWikiIndex(root, mockConfig);
    expect(
      resolveMarkdownHrefToDocId(
        "/docs/ko/guides/i18n",
        "ko/guides/landing",
        index,
        mockConfig,
      ),
    ).toBe("ko/guides/i18n");
  });

  it("resolves relative path", () => {
    const index = buildWikiIndex(root, mockConfig);
    expect(
      resolveMarkdownHrefToDocId(
        "./i18n",
        "ko/guides/landing",
        index,
        mockConfig,
      ),
    ).toBe("ko/guides/i18n");
  });

  it("resolves same-origin full URL", () => {
    const index = buildWikiIndex(root, mockConfig);
    expect(
      resolveMarkdownHrefToDocId(
        "https://barodoc.dev/docs/ko/guides/cli",
        "ko/guides/landing",
        index,
        mockConfig,
      ),
    ).toBe("ko/guides/cli");
  });

  it("resolves default-locale path without /en/ segment", () => {
    const index = buildWikiIndex(root, mockConfig);
    expect(
      resolveMarkdownHrefToDocId(
        "/docs/guides/installation",
        "en/quickstart",
        index,
        mockConfig,
      ),
    ).toBe("en/guides/installation");
  });

  it("resolves legacy /ko/docs/... paths", () => {
    const index = buildWikiIndex(root, mockConfig);
    expect(
      resolveMarkdownHrefToDocId(
        "/ko/docs/quickstart",
        "ko/introduction",
        index,
        mockConfig,
      ),
    ).toBe("ko/quickstart");
  });
});

describe("normalizeLegacyLocaleDocsPath", () => {
  it("rewrites locale/docs order", () => {
    expect(normalizeLegacyLocaleDocsPath("/ko/docs/quickstart")).toBe(
      "/docs/ko/quickstart",
    );
  });
});

describe("shouldReportUnresolvedWikiHref", () => {
  it("does not flag non-content routes", () => {
    expect(shouldReportUnresolvedWikiHref("/yaml-landing-demo", mockConfig)).toBe(
      false,
    );
  });
  it("flags docs paths", () => {
    expect(shouldReportUnresolvedWikiHref("/docs/missing-page", mockConfig)).toBe(
      true,
    );
  });
});

describe("hrefLooksLikeInternalLink", () => {
  it("treats site-relative paths as internal", () => {
    expect(hrefLooksLikeInternalLink("/docs/ko/guides/cli", mockConfig)).toBe(
      true,
    );
  });
  it("treats other origins as external", () => {
    expect(
      hrefLooksLikeInternalLink("https://example.com/foo", mockConfig),
    ).toBe(false);
  });
});
