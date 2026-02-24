import { describe, it, expect } from "vitest";
import {
  getLocaleFromPath,
  removeLocaleFromPath,
  getLocalizedPath,
  getLocalizedNavGroup,
  getLocaleLabel,
  getAllLocalePaths,
} from "./utils.js";

const i18n = { defaultLocale: "en", locales: ["en", "ko", "ja"] };

describe("getLocaleFromPath", () => {
  it("returns locale when path starts with a known locale", () => {
    expect(getLocaleFromPath("/ko/guides/setup", i18n)).toBe("ko");
    expect(getLocaleFromPath("/ja/introduction", i18n)).toBe("ja");
  });

  it("returns default locale when path has no locale prefix", () => {
    expect(getLocaleFromPath("/guides/setup", i18n)).toBe("en");
    expect(getLocaleFromPath("/", i18n)).toBe("en");
  });

  it("returns default locale for unknown locale prefix", () => {
    expect(getLocaleFromPath("/fr/docs", i18n)).toBe("en");
  });
});

describe("removeLocaleFromPath", () => {
  it("strips known locale prefix", () => {
    expect(removeLocaleFromPath("/ko/guides/setup", i18n)).toBe("/guides/setup");
    expect(removeLocaleFromPath("/ja/intro", i18n)).toBe("/intro");
  });

  it("leaves path unchanged when no locale prefix", () => {
    expect(removeLocaleFromPath("/guides/setup", i18n)).toBe("/guides/setup");
  });

  it("leaves path unchanged for unknown locale", () => {
    expect(removeLocaleFromPath("/fr/docs", i18n)).toBe("/fr/docs");
  });
});

describe("getLocalizedPath", () => {
  it("returns clean path for default locale", () => {
    expect(getLocalizedPath("/ko/guides/setup", "en", i18n)).toBe("/guides/setup");
  });

  it("prefixes path with locale for non-default locale", () => {
    expect(getLocalizedPath("/guides/setup", "ko", i18n)).toBe("/ko/guides/setup");
  });

  it("swaps locale prefix correctly", () => {
    expect(getLocalizedPath("/ko/intro", "ja", i18n)).toBe("/ja/intro");
  });
});

describe("getLocalizedNavGroup", () => {
  const item = { group: "Guides", "group:ko": "가이드", pages: [] };

  it("returns default group for default locale", () => {
    expect(getLocalizedNavGroup(item, "en", "en")).toBe("Guides");
  });

  it("returns localized group for non-default locale", () => {
    expect(getLocalizedNavGroup(item, "ko", "en")).toBe("가이드");
  });

  it("falls back to default group when translation is missing", () => {
    expect(getLocalizedNavGroup(item, "ja", "en")).toBe("Guides");
  });
});

describe("getLocaleLabel", () => {
  it("returns custom label when provided", () => {
    expect(getLocaleLabel("ko", { ko: "Korean" })).toBe("Korean");
  });

  it("returns built-in default label", () => {
    expect(getLocaleLabel("ko")).toBe("한국어");
    expect(getLocaleLabel("en")).toBe("English");
    expect(getLocaleLabel("ja")).toBe("日本語");
  });

  it("returns uppercased locale code when no label exists", () => {
    expect(getLocaleLabel("pt")).toBe("PT");
  });
});

describe("getAllLocalePaths", () => {
  it("returns paths for all locales", () => {
    const paths = getAllLocalePaths("/guides/setup", i18n);
    expect(paths).toEqual([
      { locale: "en", path: "/guides/setup" },
      { locale: "ko", path: "/ko/guides/setup" },
      { locale: "ja", path: "/ja/guides/setup" },
    ]);
  });
});
