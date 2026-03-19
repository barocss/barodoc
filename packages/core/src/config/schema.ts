import { z } from "zod";

/** A single page path, or an expandable group with label and child pages (sidebar hierarchy). */
export const navPageEntrySchema = z.union([
  z.string(),
  z.object({
    label: z.string(),
    pages: z.array(z.string()),
  }).passthrough(), // Allow label:ko, label:ja, etc.
]);

export const navItemSchema = z.object({
  group: z.string(),
  pages: z.array(navPageEntrySchema),
}).passthrough(); // Allow group:ko, group:ja, etc.

export const i18nConfigSchema = z.object({
  defaultLocale: z.string(),
  locales: z.array(z.string()),
  labels: z.record(z.string()).optional(),
  /** Per-locale UI string overrides. */
  translations: z.record(z.string(), z.record(z.string(), z.string())).optional(),
  /** Per-locale text direction (e.g. { ar: "rtl", he: "rtl" }). */
  dir: z.record(z.string(), z.enum(["ltr", "rtl"])).optional(),
}).optional();

export const grayPresets = [
  "zinc", "slate", "neutral", "stone", "gray",
] as const;

export type GrayPreset = (typeof grayPresets)[number];

export const themeColorsSchema = z.object({
  accent: z.string().optional(),
  gray: z.union([
    z.enum(grayPresets),
    z.string(),
  ]).optional(),
  light: z.object({
    accent: z.string().optional(),
  }).optional(),
  dark: z.object({
    accent: z.string().optional(),
  }).optional(),
}).optional();

export const themeConfigSchema = z.object({
  colors: themeColorsSchema,
  fonts: z.object({
    heading: z.string().optional(),
    body: z.string().optional(),
    code: z.string().optional(),
  }).optional(),
  radius: z.string().optional(),
}).optional();

export const topbarSchema = z.object({
  github: z.string().optional(),
  discord: z.string().optional(),
  twitter: z.string().optional(),
}).optional();

export const searchSchema = z.object({
  enabled: z.boolean().optional(),
}).optional();

export const lineNumbersSchema = z.boolean().optional();

export const editLinkSchema = z.object({
  baseUrl: z.string(),
}).optional();

export const announcementSchema = z.object({
  text: z.string(),
  link: z.string().optional(),
  dismissible: z.boolean().optional(),
}).optional();

export const feedbackSchema = z.object({
  enabled: z.boolean(),
  endpoint: z.string().optional(),
}).optional();

/** Frontmatter schema for MDX/MD content files. Reusable across custom and quick mode. */
export const docsFrontmatterSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
  category: z.string().optional(),
  api_reference: z.boolean().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  lastUpdated: z.date().optional(),
});

export type DocsFrontmatter = z.infer<typeof docsFrontmatterSchema>;

export const pluginConfigSchema = z.union([
  z.string(),
  z.tuple([z.string(), z.record(z.unknown())]),
]);

export const blogConfigSchema = z.object({
  enabled: z.boolean().optional(),
}).optional();

export const versionConfigSchema = z.object({
  label: z.string(),
  path: z.string(),
}).strict();

export const versionsSchema = z.array(versionConfigSchema).optional();

export const tabSchema = z.object({
  label: z.string(),
  href: z.string(),
}).passthrough(); // Allow label:ko, label:ja, etc. for tab labels

export const sectionSchema = z.object({
  slug: z.string(),
  label: z.string().optional(),
  navigation: z.array(navItemSchema),
}).passthrough(); // Allow label:ko, label:ja, etc.

export const barodocConfigSchema = z.object({
  name: z.string(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  site: z.string().optional(),
  base: z.string().optional(),
  theme: themeConfigSchema,
  i18n: i18nConfigSchema,
  navigation: z.array(navItemSchema),
  sections: z.array(sectionSchema).optional(),
  tabs: z.array(tabSchema).optional(),
  topbar: topbarSchema,
  search: searchSchema,
  lineNumbers: lineNumbersSchema,
  editLink: editLinkSchema,
  lastUpdated: z.boolean().optional(),
  announcement: announcementSchema,
  feedback: feedbackSchema,
  blog: blogConfigSchema,
  versions: versionsSchema,
  plugins: z.array(pluginConfigSchema).optional(),
  customCss: z.array(z.string()).optional(),
});

export type BarodocConfigInput = z.input<typeof barodocConfigSchema>;
export type BarodocConfigOutput = z.output<typeof barodocConfigSchema>;
