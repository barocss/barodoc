import type { BarodocI18nConfig, ResolvedBarodocConfig } from "./types";

declare module "virtual:barodoc/config" {
  const config: ResolvedBarodocConfig;
  export default config;
}

declare module "virtual:barodoc/i18n" {
  export const i18n: BarodocI18nConfig | undefined;
  export const defaultLocale: string;
  export const locales: string[];
  /** UI strings per locale (key -> value). */
  export const uiStrings: Record<string, Record<string, string>>;
  /** Text direction per locale. */
  export const dirByLocale: Record<string, "ltr" | "rtl">;
}
