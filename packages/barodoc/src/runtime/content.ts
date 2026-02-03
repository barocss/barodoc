import matter from "gray-matter";

export interface ExtractedFrontmatter {
  title: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Extract frontmatter from markdown content
 * If no frontmatter exists, extract title from first heading
 */
export function extractFrontmatter(content: string): {
  data: ExtractedFrontmatter;
  content: string;
} {
  // Try to parse YAML frontmatter
  const { data, content: body } = matter(content);

  // If title exists in frontmatter, use it
  if (data.title) {
    return {
      data: data as ExtractedFrontmatter,
      content: body,
    };
  }

  // Extract title from first heading
  const titleMatch = body.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1] || "Untitled";

  // Extract description from first paragraph
  const description = extractFirstParagraph(body);

  return {
    data: {
      ...data,
      title,
      description,
    },
    content: body,
  };
}

/**
 * Extract first paragraph from markdown content
 */
function extractFirstParagraph(content: string): string | undefined {
  // Remove headings and find first paragraph
  const lines = content.split("\n");
  let inParagraph = false;
  let paragraph = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip headings, empty lines at start, code blocks, lists
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("```")) break;
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) continue;
    if (trimmed.startsWith(">")) continue;

    if (trimmed === "") {
      if (inParagraph) break;
      continue;
    }

    inParagraph = true;
    paragraph += (paragraph ? " " : "") + trimmed;
  }

  return paragraph || undefined;
}

/**
 * Process markdown file for content collection
 */
export function processMarkdown(
  filePath: string,
  content: string
): {
  frontmatter: ExtractedFrontmatter;
  body: string;
} {
  const { data, content: body } = extractFrontmatter(content);

  return {
    frontmatter: data,
    body,
  };
}

/**
 * Convert file path to slug
 * e.g., "docs/en/guides/getting-started.md" -> "en/guides/getting-started"
 */
export function pathToSlug(filePath: string, docsDir: string): string {
  let slug = filePath
    .replace(docsDir, "")
    .replace(/^\//, "")
    .replace(/\.(md|mdx)$/, "");

  return slug;
}

/**
 * Get locale from file path
 */
export function getLocaleFromFilePath(
  filePath: string,
  docsDir: string,
  locales: string[]
): string | null {
  const slug = pathToSlug(filePath, docsDir);
  const firstSegment = slug.split("/")[0];

  if (locales.includes(firstSegment)) {
    return firstSegment;
  }

  return null;
}
