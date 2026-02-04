import type { AstroIntegration } from "astro";
import type { PluginConfig } from "./plugins/types.js";

export interface BarodocNavItem {
  group: string;
  "group:ko"?: string;
  "group:ja"?: string;
  [key: `group:${string}`]: string | undefined;
  pages: string[];
}

export interface BarodocI18nConfig {
  defaultLocale: string;
  locales: string[];
  labels?: Record<string, string>;
}

export interface BarodocThemeColors {
  primary?: string;
  background?: string;
  backgroundDark?: string;
  text?: string;
  textDark?: string;
  border?: string;
  borderDark?: string;
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

export interface BarodocConfig {
  name: string;
  logo?: string;
  favicon?: string;
  
  theme?: BarodocThemeConfig;
  
  i18n?: BarodocI18nConfig;
  
  navigation: BarodocNavItem[];
  
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
