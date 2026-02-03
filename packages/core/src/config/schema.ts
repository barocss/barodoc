import { z } from "zod";

export const navItemSchema = z.object({
  group: z.string(),
  pages: z.array(z.string()),
}).passthrough(); // Allow group:ko, group:ja, etc.

export const i18nConfigSchema = z.object({
  defaultLocale: z.string(),
  locales: z.array(z.string()),
  labels: z.record(z.string()).optional(),
}).optional();

export const themeColorsSchema = z.object({
  primary: z.string().optional(),
  background: z.string().optional(),
  backgroundDark: z.string().optional(),
  text: z.string().optional(),
  textDark: z.string().optional(),
  border: z.string().optional(),
  borderDark: z.string().optional(),
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

export const barodocConfigSchema = z.object({
  name: z.string(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  theme: themeConfigSchema,
  i18n: i18nConfigSchema,
  navigation: z.array(navItemSchema),
  topbar: topbarSchema,
  search: searchSchema,
  customCss: z.array(z.string()).optional(),
});

export type BarodocConfigInput = z.input<typeof barodocConfigSchema>;
export type BarodocConfigOutput = z.output<typeof barodocConfigSchema>;
