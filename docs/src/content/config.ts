import { defineCollection, z } from "astro:content";

const docsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
    category: z.string().optional(),
    api_reference: z.boolean().optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    lastUpdated: z.date().optional(),
    since: z.string().optional(),
    deprecated: z.union([z.boolean(), z.string()]).optional(),
    experimental: z.boolean().optional(),
    changelogUrl: z.string().optional(),
  }),
});

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    date: z.coerce.date().optional(),
    author: z.string().optional(),
    avatar: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    /** Custom URL slug (Astro reserves `slug` for internal use). Use in frontmatter as `urlSlug`. */
    urlSlug: z.string().optional(),
  }),
});

const changelogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    version: z.string(),
    date: z.coerce.date(),
  }),
});

const helpCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    since: z.string().optional(),
    deprecated: z.union([z.boolean(), z.string()]).optional(),
    experimental: z.boolean().optional(),
    changelogUrl: z.string().optional(),
  }),
});

/** Declarative landing blocks (VuePress-style); use with `pageLayout: landing`. Key is `landingPage`. */
const landingPageFrontmatterSchema = z
  .object({
    hero: z
      .object({
        badge: z.string().optional(),
        title: z.string(),
        titleHighlight: z.string().optional(),
        subtitle: z.string(),
        primaryCta: z.object({ label: z.string(), href: z.string() }),
        secondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
        snippet: z.string().optional(),
        snippetAriaLabel: z.string().optional(),
      })
      .optional(),
    logoStrip: z
      .object({
        title: z.string().optional(),
        items: z.array(
          z.object({
            name: z.string(),
            href: z.string().optional(),
          }),
        ),
      })
      .optional(),
    stats: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        items: z.array(
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        ),
      })
      .optional(),
    features: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        items: z.array(
          z.object({
            icon: z.string(),
            title: z.string(),
            description: z.string(),
          }),
        ),
      })
      .optional(),
    testimonials: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        items: z.array(
          z.object({
            quote: z.string(),
            author: z.string(),
            role: z.string(),
            avatar: z.string().optional(),
          }),
        ),
      })
      .optional(),
    pricing: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        plans: z.array(
          z.object({
            name: z.string(),
            price: z.string(),
            period: z.string().optional(),
            description: z.string().optional(),
            features: z.array(z.string()),
            ctaLabel: z.string(),
            ctaHref: z.string(),
            highlighted: z.boolean().optional(),
          }),
        ),
      })
      .optional(),
    faq: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        items: z.array(
          z.object({
            q: z.string(),
            a: z.string(),
          }),
        ),
      })
      .optional(),
    cta: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        buttonLabel: z.string(),
        buttonHref: z.string(),
      })
      .optional(),
    footer: z
      .object({
        tagline: z.string().optional(),
        showLogo: z.boolean().optional(),
        links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
      })
      .optional(),
  })
  .optional();

const pagesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    /**
     * `landing` = full-width marketing layout. Use **`pageLayout`** — Astro 5 reserves `layout` for Markdown in content collections.
     * @deprecated `layout` — ignored for `.md` in Astro 5; use `pageLayout` instead.
     */
    pageLayout: z.enum(["default", "landing"]).optional(),
    layout: z.enum(["default", "landing"]).optional(),
    /** With `pageLayout: landing`, optional YAML blocks (see Guides → Landing pages). */
    landingPage: landingPageFrontmatterSchema,
  }),
});

export const collections = {
  docs: docsCollection,
  blog: blogCollection,
  changelog: changelogCollection,
  help: helpCollection,
  pages: pagesCollection,
};
