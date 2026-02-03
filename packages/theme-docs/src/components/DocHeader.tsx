import * as React from "react";
import { Search, Menu, Moon, Sun, Github } from "lucide-react";
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
}

export function DocHeader({
  siteName,
  logo,
  githubUrl,
  hasMultipleLocales,
  currentLocale,
  localeLabels,
}: DocHeaderProps) {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

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
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--color-bg)]/80">
        <div className="flex h-14 items-center justify-between px-4 max-w-[1120px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="flex items-center gap-2.5 font-semibold text-[var(--color-text)] hover:opacity-80 transition-opacity"
            >
              {logo && <img src={logo} alt={siteName} className="h-7 w-7" />}
              <span className="text-lg">{siteName}</span>
            </a>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
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
