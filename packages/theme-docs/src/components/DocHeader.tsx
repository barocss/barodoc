import * as React from "react";
import { Search, Menu, Moon, Sun, Github, Globe, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "../lib/utils";

interface TabItem {
  label: string;
  href: string;
}

interface DocHeaderProps {
  siteName: string;
  logo?: string;
  tabs?: TabItem[];
  githubUrl?: string;
  hasMultipleLocales?: boolean;
  currentLocale?: string;
  localeLabels?: Record<string, string>;
  currentPath?: string;
  locales?: string[];
  defaultLocale?: string;
  /** UI strings for current locale (menu, search, toggleTheme, etc.). */
  uiStrings?: Record<string, string>;
}

function getLocalizedUrl(
  path: string,
  locale: string,
  defaultLocale: string,
): string {
  const docsPrefix = "/docs/";
  const koPrefix = "/docs/ko/";

  if (path.startsWith(koPrefix)) {
    path = path === "/docs/ko" ? "/docs" : docsPrefix + path.slice(koPrefix.length);
  }

  if (locale === defaultLocale) {
    return path || "/";
  }
  if (path === "/" || !path.startsWith(docsPrefix)) {
    return path === "/" ? "/docs/ko/introduction" : path;
  }
  return docsPrefix + "ko/" + path.slice(docsPrefix.length);
}

export function DocHeader({
  siteName,
  logo,
  tabs = [],
  githubUrl,
  hasMultipleLocales,
  currentLocale = "en",
  localeLabels = {},
  currentPath = "",
  locales = [],
  defaultLocale = "en",
  uiStrings: uiStringsProp = {},
}: DocHeaderProps) {
  const t = (key: string, fallback: string) => uiStringsProp[key] ?? fallback;
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [langOpen, setLangOpen] = React.useState(false);
  const langRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const openSearch = () => {
    document.dispatchEvent(new CustomEvent("toggle-search"));
  };

  const openMobileNav = () => {
    document.dispatchEvent(new CustomEvent("toggle-mobile-nav", { bubbles: true }));
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full min-w-0 border-b border-[var(--bd-border)] bg-[var(--bd-bg)]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--bd-bg)]/80">
        <div className="flex h-14 items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 w-full min-w-0">
          {/* Left: hamburger (mobile) + logo + tabs */}
          <div className="flex items-center gap-3 md:gap-6 min-w-0 shrink">
            {/* Mobile menu — left so it matches sheet sliding from left */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="xl:hidden h-9 w-9 -ml-1 shrink-0 text-[var(--bd-text-secondary)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-bg-subtle)]"
              onClick={openMobileNav}
              aria-label={t("menu", "Menu")}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <a
              href="/"
              className="flex items-center gap-2.5 min-w-0 shrink overflow-hidden font-semibold text-[var(--bd-text-heading)] hover:opacity-80 transition-opacity"
            >
              {logo && <img src={logo} alt={siteName} className="h-7 w-7 shrink-0" />}
              <span className="text-[15px] tracking-tight truncate">{siteName}</span>
            </a>
            {tabs.length > 0 && (
              <nav className="hidden xl:flex items-center gap-1">
                {tabs.map((tab) => {
                  const isActive = currentPath === tab.href || currentPath.startsWith(tab.href + "/");
                  return (
                    <a
                      key={tab.href}
                      href={tab.href}
                      className={cn(
                        "px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors",
                        isActive
                          ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50"
                          : "text-[var(--bd-text-secondary)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-bg-subtle)]"
                      )}
                    >
                      {tab.label}
                    </a>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search button */}
            <Button
              variant="outline"
              className="hidden xl:flex items-center gap-3 px-3 py-1.5 h-9 min-w-[220px] justify-start rounded-lg border-[var(--bd-border)]"
              onClick={openSearch}
            >
              <Search className="h-4 w-4 shrink-0 text-[var(--bd-text-muted)]" />
              <span className="flex-1 text-left text-sm text-[var(--bd-text-muted)]">
                {t("searchPlaceholder", "Search...")}
              </span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-[var(--bd-bg-subtle)] border border-[var(--bd-border)] rounded text-[var(--bd-text-muted)]">
                <span>⌘</span>K
              </kbd>
            </Button>

            {/* Mobile search button (shown below xl so header stays uncluttered) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="xl:hidden"
                  onClick={openSearch}
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">{t("search", "Search")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("search", "Search")}</TooltipContent>
            </Tooltip>

            {/* Divider */}
            <Separator orientation="vertical" className="hidden xl:block h-5 mx-1.5" />

            {/* GitHub link */}
            {githubUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[var(--bd-text-secondary)] hover:text-[var(--bd-text)]"
                    asChild
                  >
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-[18px] w-[18px]" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>GitHub</TooltipContent>
              </Tooltip>
            )}

            {/* Language switcher */}
            {hasMultipleLocales && locales.length > 0 && (
              <>
                <Separator orientation="vertical" className="hidden xl:block h-5 mx-1" />
                <div className="relative" ref={langRef}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 gap-1 px-2 text-[var(--bd-text-secondary)] hover:text-[var(--bd-text)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLangOpen((o) => !o);
                        }}
                      >
                        <Globe className="h-4 w-4" />
                        <span className="text-[13px] hidden sm:inline">
                          {localeLabels[currentLocale] ?? currentLocale}
                        </span>
                        <ChevronDown className="h-3 w-3" />
                        <span className="sr-only">{t("language", "Language")}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Language</TooltipContent>
                  </Tooltip>
                  {langOpen && (
                    <div
                      className="absolute right-0 mt-1 py-1 min-w-[8rem] rounded-lg border border-[var(--bd-border)] bg-[var(--bd-bg)] shadow-[var(--bd-shadow-lg)] z-50"
                      role="menu"
                    >
                      {locales.map((locale) => (
                        <a
                          key={locale}
                          href={getLocalizedUrl(currentPath, locale, defaultLocale)}
                          className={cn(
                            "block px-3 py-1.5 text-[13px] transition-colors",
                            locale === currentLocale
                              ? "bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-medium"
                              : "text-[var(--bd-text)] hover:bg-[var(--bd-bg-subtle)]"
                          )}
                          role="menuitem"
                        >
                          {localeLabels[locale] ?? locale}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[var(--bd-text-secondary)] hover:text-[var(--bd-text)]"
                  onClick={toggleTheme}
                >
                  {theme === "light" ? (
                    <Moon className="h-[18px] w-[18px]" />
                  ) : (
                    <Sun className="h-[18px] w-[18px]" />
                  )}
                  <span className="sr-only">{t("toggleTheme", "Toggle theme")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {theme === "light" ? (t("toggleTheme", "Toggle theme") + " (dark)") : (t("toggleTheme", "Toggle theme") + " (light)")}
              </TooltipContent>
            </Tooltip>

          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}

export default DocHeader;
