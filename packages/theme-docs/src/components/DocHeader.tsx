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

interface DocHeaderProps {
  siteName: string;
  logo?: string;
  githubUrl?: string;
  hasMultipleLocales?: boolean;
  currentLocale?: string;
  localeLabels?: Record<string, string>;
  currentPath?: string;
  locales?: string[];
  defaultLocale?: string;
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
  githubUrl,
  hasMultipleLocales,
  currentLocale = "en",
  localeLabels = {},
  currentPath = "",
  locales = [],
  defaultLocale = "en",
}: DocHeaderProps) {
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
    document.dispatchEvent(new CustomEvent("toggle-mobile-nav"));
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full min-w-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--color-bg)]/80">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4 max-w-[1120px] mx-auto min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-6 min-w-0 shrink">
            <a
              href="/"
              className="flex items-center gap-2 min-w-0 shrink overflow-hidden font-semibold text-[var(--color-text)] hover:opacity-80 transition-opacity"
            >
              {logo && <img src={logo} alt={siteName} className="h-7 w-7 shrink-0" />}
              <span className="text-lg truncate">{siteName}</span>
            </a>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Search button */}
            <Button
              variant="outline"
              className="hidden md:flex items-center gap-3 px-4 py-2 h-10 min-w-[200px] justify-start rounded-xl"
              onClick={openSearch}
            >
              <Search className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
              <span className="flex-1 text-left text-[var(--color-text-muted)]">
                Search...
              </span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text-muted)]">
                <span>⌘</span>K
              </kbd>
            </Button>

            {/* Mobile search button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-xl"
                  onClick={openSearch}
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>

            {/* Divider */}
            <Separator orientation="vertical" className="hidden md:block h-6 mx-2" />

            {/* GitHub link */}
            {githubUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    asChild
                  >
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-5 w-5" />
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
                <Separator orientation="vertical" className="hidden md:block h-6 mx-2" />
                <div className="relative" ref={langRef}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="rounded-xl gap-1 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLangOpen((o) => !o);
                        }}
                      >
                        <Globe className="h-4 w-4" />
                        <span className="text-sm hidden sm:inline">
                          {localeLabels[currentLocale] ?? currentLocale}
                        </span>
                        <ChevronDown className="h-3 w-3" />
                        <span className="sr-only">Language</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Language</TooltipContent>
                  </Tooltip>
                  {langOpen && (
                    <div
                      className="absolute right-0 mt-1 py-1 min-w-[8rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg z-50"
                      role="menu"
                    >
                      {locales.map((locale) => (
                        <a
                          key={locale}
                          href={getLocalizedUrl(currentPath, locale, defaultLocale)}
                          className={cn(
                            "block px-3 py-2 text-sm transition-colors",
                            locale === currentLocale
                              ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                              : "text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
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
                  className="rounded-xl"
                  onClick={toggleTheme}
                >
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {theme === "light" ? "Dark mode" : "Light mode"}
              </TooltipContent>
            </Tooltip>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={openMobileNav}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}

export default DocHeader;
