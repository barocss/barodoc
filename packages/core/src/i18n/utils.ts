import type { BarodocI18nConfig, BarodocNavItem } from "../types.js";

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
