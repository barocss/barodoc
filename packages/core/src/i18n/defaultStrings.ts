/**
 * Default UI strings (English). Keys can be overridden per locale via config.i18n.translations.
 */
export const DEFAULT_UI_STRINGS: Record<string, string> = {
  lastUpdated: "Last updated",
  editPage: "Edit this page",
  onThisPage: "On this page",
  previous: "Previous",
  next: "Next",
  search: "Search",
  searchPlaceholder: "Search documentation...",
  copyCode: "Copy code",
  copied: "Copied",
  noResults: "No results found",
  searchIndexNotAvailable: "Search index not available",
  menu: "Menu",
  close: "Close",
  toggleTheme: "Toggle theme",
  language: "Language",
  changelog: "Changelog",
  releaseHistory: "Release history and notable changes",
  noChangelogEntries: "No changelog entries yet.",
  blog: "Blog",
  wasThisHelpful: "Was this helpful?",
  yes: "Yes",
  no: "No",
  searchDocumentation: "Search documentation",
  previousPage: "Previous page",
  nextPage: "Next page",
  getStarted: "Get Started",
  documentation: "Documentation",
  showShortcuts: "Show shortcuts",
};

/** Optional default strings for other locales (partial overrides). */
export const DEFAULT_UI_STRINGS_KO: Record<string, string> = {
  lastUpdated: "마지막 업데이트",
  editPage: "이 페이지 수정",
  onThisPage: "이 페이지에서",
  previous: "이전",
  next: "다음",
  search: "검색",
  searchPlaceholder: "문서 검색...",
  copyCode: "코드 복사",
  copied: "복사됨",
  noResults: "검색 결과 없음",
  searchIndexNotAvailable: "검색 인덱스를 사용할 수 없습니다",
  menu: "메뉴",
  close: "닫기",
  toggleTheme: "테마 전환",
  language: "언어",
  changelog: "변경 사항",
  releaseHistory: "릴리스 기록 및 주요 변경 사항",
  noChangelogEntries: "아직 변경 사항이 없습니다.",
  blog: "블로그",
  wasThisHelpful: "도움이 되었나요?",
  yes: "예",
  no: "아니오",
  searchDocumentation: "문서 검색",
  previousPage: "이전 페이지",
  nextPage: "다음 페이지",
  getStarted: "시작하기",
  documentation: "문서",
  showShortcuts: "단축키 보기",
};

export function getDefaultUIStringsForLocale(locale: string): Record<string, string> {
  if (locale === "ko") {
    return { ...DEFAULT_UI_STRINGS, ...DEFAULT_UI_STRINGS_KO };
  }
  return { ...DEFAULT_UI_STRINGS };
}
