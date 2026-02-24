import { describe, it, expect } from "vitest";
import { extractFrontmatter, processMarkdown, pathToSlug, getLocaleFromFilePath } from "./content.js";

describe("extractFrontmatter", () => {
  it("extracts YAML frontmatter", () => {
    const md = `---
title: Hello World
description: A test doc
---

## Content here`;
    const result = extractFrontmatter(md);
    expect(result.data.title).toBe("Hello World");
    expect(result.data.description).toBe("A test doc");
  });

  it("extracts title from first heading when no frontmatter title", () => {
    const md = `# My Page Title

This is the first paragraph.

## Section`;
    const result = extractFrontmatter(md);
    expect(result.data.title).toBe("My Page Title");
    expect(result.data.description).toBe("This is the first paragraph.");
  });

  it("returns 'Untitled' when no title or heading found", () => {
    const md = `Just some content without a heading.`;
    const result = extractFrontmatter(md);
    expect(result.data.title).toBe("Untitled");
  });

  it("preserves extra frontmatter fields", () => {
    const md = `---
title: Test
tags:
  - guide
  - setup
---
Content`;
    const result = extractFrontmatter(md);
    expect(result.data.tags).toEqual(["guide", "setup"]);
  });
});

describe("processMarkdown", () => {
  it("returns frontmatter and body", () => {
    const md = `---
title: Test Doc
---

Body content here`;
    const result = processMarkdown("test.md", md);
    expect(result.frontmatter.title).toBe("Test Doc");
    expect(result.body).toContain("Body content here");
  });
});

describe("pathToSlug", () => {
  it("converts file path to slug", () => {
    expect(pathToSlug("/docs/en/guides/setup.md", "/docs")).toBe("en/guides/setup");
  });

  it("handles .mdx extension", () => {
    expect(pathToSlug("/docs/en/intro.mdx", "/docs")).toBe("en/intro");
  });

  it("strips leading slash after removing docsDir", () => {
    expect(pathToSlug("/docs/introduction.md", "/docs")).toBe("introduction");
  });
});

describe("getLocaleFromFilePath", () => {
  it("returns locale when file is in a locale directory", () => {
    expect(getLocaleFromFilePath("/docs/en/intro.md", "/docs", ["en", "ko"])).toBe("en");
    expect(getLocaleFromFilePath("/docs/ko/guides/setup.md", "/docs", ["en", "ko"])).toBe("ko");
  });

  it("returns null when file is not in a locale directory", () => {
    expect(getLocaleFromFilePath("/docs/intro.md", "/docs", ["en", "ko"])).toBeNull();
  });

  it("returns null for unknown locale", () => {
    expect(getLocaleFromFilePath("/docs/fr/intro.md", "/docs", ["en", "ko"])).toBeNull();
  });
});
