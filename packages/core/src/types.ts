import type { AstroIntegration } from "astro";
import type { PluginConfig } from "./plugins/types.js";

/** A single page path or an expandable sidebar group with label and child pages. */
export type BarodocNavPageEntry =
  | string
  | { label: string; "label:ko"?: string; "label:ja"?: string; [key: `label:${string}`]: string | undefined; pages: string[] };

export interface BarodocNavItem {
  group: string;
  "group:ko"?: string;
  "group:ja"?: string;
  [key: `group:${string}`]: string | undefined;
  pages: BarodocNavPageEntry[];
}

export interface BarodocI18nConfig {
  defaultLocale: string;
  locales: string[];
  labels?: Record<string, string>;
  /** Per-locale UI string overrides (key → value). Merged over default strings. */
  translations?: Record<string, Record<string, string>>;
  /** Per-locale text direction (e.g. { ar: "rtl", he: "rtl" }). */
  dir?: Record<string, "ltr" | "rtl">;
}

export interface BarodocThemeColors {
  accent?: string;
  gray?: string;
  light?: {
    accent?: string;
  };
  dark?: {
    accent?: string;
  };
}

export interface BarodocThemeConfig {
  colors?: BarodocThemeColors;
  fonts?: {
    heading?: string;
    body?: string;
    code?: string;
  };
  radius?: string;
}

export interface BarodocSection {
  slug: string;
  label?: string;
  "label:ko"?: string;
  "label:ja"?: string;
  [key: `label:${string}`]: string | undefined;
  navigation: BarodocNavItem[];
}

export interface BarodocConfig {
  name: string;
  logo?: string;
  favicon?: string;
  site?: string;
  base?: string;
  
  theme?: BarodocThemeConfig;
  
  i18n?: BarodocI18nConfig;
  
  navigation: BarodocNavItem[];

  /** Additional doc sections beyond the default "docs" (e.g. help, guides). */
  sections?: BarodocSection[];
  
  tabs?: {
    label: string;
    href: string;
  }[];

  topbar?: {
    github?: string;
    discord?: string;
    twitter?: string;
  };
  
  search?: {
    enabled?: boolean;
  };

  /** When true, code blocks render with line numbers. */
  lineNumbers?: boolean;

  /** GitHub edit link base URL for "Edit this page" links. */
  editLink?: {
    baseUrl: string;
  };

  /** When true, shows git-based last updated timestamp on each page. */
  lastUpdated?: boolean;

  /** Site-wide link to changelog (shown on doc pages when set). Path or absolute URL. */
  changelogUrl?: string;

  /** Top-of-page announcement banner. */
  announcement?: {
    text: string;
    link?: string;
    dismissible?: boolean;
  };

  /** Page feedback widget ("Was this helpful?"). */
  feedback?: {
    enabled: boolean;
    endpoint?: string;
    /** Base URL for "Report an issue" (e.g. GitHub issues/new). Page path is appended as title query param when possible. */
    issueUrl?: string;
  };
  
  blog?: {
    enabled?: boolean;
  };

  versions?: {
    label: string;
    path: string;
  }[];
  
  plugins?: PluginConfig[];
  
  customCss?: string[];
}

export interface ThemeExport {
  name: string;
  integration: (config: ResolvedBarodocConfig) => AstroIntegration;
  pages?: Record<string, () => Promise<unknown>>;
  layouts?: Record<string, () => Promise<unknown>>;
  components?: Record<string, () => Promise<unknown>>;
  styles?: string[];
}

export interface BarodocOptions {
  config?: string;
  theme: ThemeExport;
}

export interface ResolvedBarodocConfig extends BarodocConfig {
  _resolved: true;
  _configPath: string;
}
