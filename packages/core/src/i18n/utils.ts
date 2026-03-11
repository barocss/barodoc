import type { BarodocI18nConfig, BarodocNavItem, BarodocSection } from "../types.js";
import { getDefaultUIStringsForLocale } from "./defaultStrings.js";

export function getLocaleFromPath(
  path: string,
  i18n: BarodocI18nConfig
): string {
  const segments = path.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && i18n.locales.includes(firstSegment)) {
    return firstSegment;
  }

  return i18n.defaultLocale;
}

export function removeLocaleFromPath(
  path: string,
  i18n: BarodocI18nConfig
): string {
  const segments = path.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && i18n.locales.includes(firstSegment)) {
    return "/" + segments.slice(1).join("/");
  }

  return path;
}

export function getLocalizedPath(
  path: string,
  locale: string,
  i18n: BarodocI18nConfig
): string {
  const cleanPath = removeLocaleFromPath(path, i18n);

  if (locale === i18n.defaultLocale) {
    return cleanPath;
  }

  return `/${locale}${cleanPath}`;
}

export function getLocalizedNavGroup(
  item: BarodocNavItem,
  locale: string,
  defaultLocale: string
): string {
  if (locale === defaultLocale) {
    return item.group;
  }

  const localizedKey = `group:${locale}` as const;
  return item[localizedKey] || item.group;
}

export function getLocaleLabel(
  locale: string,
  labels?: Record<string, string>
): string {
  if (labels && labels[locale]) {
    return labels[locale];
  }

  // Default labels
  const defaultLabels: Record<string, string> = {
    en: "English",
    ko: "한국어",
    ja: "日本語",
    zh: "中文",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
  };

  return defaultLabels[locale] || locale.toUpperCase();
}

export function getAllLocalePaths(
  basePath: string,
  i18n: BarodocI18nConfig
): Array<{ locale: string; path: string }> {
  return i18n.locales.map((locale) => ({
    locale,
    path: getLocalizedPath(basePath, locale, i18n),
  }));
}

export function getLocalizedSectionLabel(
  section: BarodocSection,
  locale: string,
  defaultLocale: string
): string {
  if (!section.label) return section.slug ?? "";
  if (locale === defaultLocale) return section.label;
  const key = `label:${locale}`;
  const extended = section as unknown as Record<string, unknown>;
  return (typeof extended[key] === "string" ? extended[key] : section.label) as string;
}

/**
 * Returns merged UI strings for a locale (defaults + config.i18n.translations).
 */
export function getUIStringsForLocale(
  locale: string,
  i18n: BarodocI18nConfig | undefined
): Record<string, string> {
  const defaults = getDefaultUIStringsForLocale(locale);
  const overrides = i18n?.translations?.[locale];
  return overrides ? { ...defaults, ...overrides } : defaults;
}

/**
 * Returns text direction for a locale. Defaults to "ltr" unless i18n.dir[locale] is "rtl".
 */
export function getDirForLocale(
  locale: string,
  i18n: BarodocI18nConfig | undefined
): "ltr" | "rtl" {
  return i18n?.dir?.[locale] ?? "ltr";
}
