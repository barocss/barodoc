import * as React from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Presentation,
  X,
  ChevronLeft,
  ChevronRight,
  Link2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

const LS_READING = "barodoc-reading-mode";

export interface DocViewControlsProps {
  slidesEnabled?: boolean;
  prevPage?: { title: string; href: string } | null;
  nextPage?: { title: string; href: string } | null;
  uiStrings?: Record<string, string>;
}

function t(ui: Record<string, string> | undefined, key: string, fallback: string) {
  return ui?.[key] ?? fallback;
}

function buildSlideHtmlStrings(article: HTMLElement): string[] {
  const segments: string[] = [];
  const children = Array.from(article.children);
  let bucket: Element[] = [];
  const flush = () => {
    if (!bucket.length) return;
    const html = bucket.map((el) => el.outerHTML).join("").trim();
    if (html) segments.push(html);
    bucket = [];
  };
  for (const child of children) {
    if (child.tagName === "HR") {
      flush();
    } else {
      bucket.push(child);
    }
  }
  flush();
  return segments.length ? segments : [article.innerHTML];
}

export function DocViewControls({
  slidesEnabled = false,
  prevPage = null,
  nextPage = null,
  uiStrings,
}: DocViewControlsProps) {
  const [readingOn, setReadingOn] = React.useState(false);
  const [slideOpen, setSlideOpen] = React.useState(false);
  const [slideIndex, setSlideIndex] = React.useState(0);
  const [slideHtml, setSlideHtml] = React.useState<string[]>([]);
  const [mounted, setMounted] = React.useState(false);
  const [slideLinkCopied, setSlideLinkCopied] = React.useState(false);
  /** Drives enter animation direction; cleared when opening the deck */
  const [slideAnimDir, setSlideAnimDir] = React.useState<"next" | "prev" | null>(null);
  const slideIndexRef = React.useRef(slideIndex);
  slideIndexRef.current = slideIndex;

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRead = params.get("read") === "1";
    const stored = localStorage.getItem(LS_READING) === "1";
    const on = urlRead || stored;
    if (on) {
      setReadingOn(true);
      document.documentElement.classList.add("bd-reading-mode");
    }
  }, []);

  const toggleReading = () => {
    setReadingOn((r) => {
      const next = !r;
      document.documentElement.classList.toggle("bd-reading-mode", next);
      localStorage.setItem(LS_READING, next ? "1" : "0");
      return next;
    });
  };

  React.useEffect(() => {
    if (!slideOpen) {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-bd-slide-open");
      return;
    }
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-bd-slide-open", "true");
    const article = document.querySelector("article.prose[data-bd-prose]");
    const chunks = article ? buildSlideHtmlStrings(article as HTMLElement) : [];
    setSlideHtml(chunks);
    let initialIndex = 0;
    if (chunks.length > 0) {
      const u = new URL(window.location.href);
      const raw = u.searchParams.get("slide");
      if (raw) {
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n) && n >= 1 && n <= chunks.length) {
          initialIndex = n - 1;
        }
      }
    }
    setSlideIndex(initialIndex);
    setSlideAnimDir(null);
    if (chunks.length > 0) {
      const u = new URL(window.location.href);
      u.searchParams.set("slide", String(initialIndex + 1));
      window.history.replaceState({}, "", u.toString());
    }
    return () => {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-bd-slide-open");
    };
  }, [slideOpen]);

  /** Keep ?slide= in sync when changing slides after open */
  React.useEffect(() => {
    if (!slideOpen || slideHtml.length === 0) return;
    const u = new URL(window.location.href);
    u.searchParams.set("slide", String(slideIndex + 1));
    window.history.replaceState({}, "", u.toString());
  }, [slideOpen, slideIndex, slideHtml.length]);

  /** Remove ?slide when leaving slide mode */
  React.useEffect(() => {
    if (slideOpen) return;
    const u = new URL(window.location.href);
    if (!u.searchParams.has("slide")) return;
    u.searchParams.delete("slide");
    window.history.replaceState({}, "", u.toString());
  }, [slideOpen]);

  const goToSlide = React.useCallback(
    (target: number) => {
      const i = slideIndexRef.current;
      const max = Math.max(0, slideHtml.length - 1);
      const next = Math.max(0, Math.min(max, target));
      if (next === i) return;
      setSlideAnimDir(next > i ? "next" : "prev");
      setSlideIndex(next);
    },
    [slideHtml.length],
  );

  const bumpSlide = React.useCallback(
    (delta: -1 | 1) => {
      const i = slideIndexRef.current;
      const max = Math.max(0, slideHtml.length - 1);
      const next = Math.max(0, Math.min(max, i + delta));
      if (next === i) return;
      setSlideAnimDir(delta === 1 ? "next" : "prev");
      setSlideIndex(next);
    },
    [slideHtml.length],
  );

  React.useEffect(() => {
    if (!slideOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSlideOpen(false);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        bumpSlide(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        bumpSlide(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [slideOpen, bumpSlide]);

  const openSlides = () => {
    if (!slidesEnabled) return;
    setSlideOpen(true);
  };

  const copySlideLink = async () => {
    const u = new URL(window.location.href);
    u.searchParams.set("slide", String(slideIndex + 1));
    const href = u.toString();
    try {
      await navigator.clipboard.writeText(href);
      setSlideLinkCopied(true);
      window.setTimeout(() => setSlideLinkCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const canSlidePrev = slideHtml.length > 0 && slideIndex > 0;
  const canSlideNext = slideHtml.length > 0 && slideIndex < slideHtml.length - 1;
  const showSlideDots = slideHtml.length > 0 && slideHtml.length <= 20;

  /** In-flow toolbar: render inside DocsLayout’s `.bd-docs-view-tools` (by title). No portal — avoids SSR/hydration falling back to fixed positioning. */
  const toolbar = (
    <div
      role="toolbar"
      aria-label={t(uiStrings, "docViewToolbar", "View options")}
      className="bd-doc-view-controls flex items-center gap-0.5 rounded-md text-[var(--bd-text-muted)]"
    >
      <Button
        type="button"
        variant={readingOn ? "secondary" : "ghost"}
        size="icon"
        className={cn(
          "h-7 w-7 shrink-0 rounded-md",
          readingOn && "bg-[var(--bd-bg-subtle)] text-[var(--bd-text)]",
        )}
        onClick={toggleReading}
        aria-pressed={readingOn}
        title={
          readingOn
            ? t(uiStrings, "exitReadingMode", "Exit reading mode")
            : t(uiStrings, "readingMode", "Reading mode")
        }
      >
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">
          {readingOn
            ? t(uiStrings, "exitReadingMode", "Exit reading mode")
            : t(uiStrings, "readingMode", "Reading mode")}
        </span>
      </Button>
      {slidesEnabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-md"
          onClick={openSlides}
          title={t(uiStrings, "slideMode", "Slide mode")}
        >
          <Presentation className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">{t(uiStrings, "slideMode", "Slides")}</span>
        </Button>
      )}
    </div>
  );

  const overlay =
    slideOpen && mounted ? (
      <div
        className="bd-slide-overlay fixed inset-0 z-[10050] flex flex-col bg-[var(--bd-bg)]"
        role="dialog"
        aria-modal="true"
        aria-label={t(uiStrings, "slideMode", "Slide mode")}
      >
        {/* Top strip: hover or focus-within reveals toolbar (background stays subtle / transparent) */}
        <div className="group bd-slide-top-hover fixed top-0 left-0 right-0 z-[10054] flex h-32 justify-center bg-gradient-to-b from-[var(--bd-bg)]/70 via-transparent to-transparent pt-3 dark:from-[var(--bd-bg)]/85">
          <div className="flex w-full max-w-3xl flex-col items-center px-3">
            <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1.5 rounded-full border border-[var(--bd-border)] bg-[var(--bd-bg)]/88 px-2 py-1.5 opacity-0 shadow-[var(--bd-shadow-lg)] backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
              <span className="min-w-[3.5rem] text-center text-xs font-medium tabular-nums text-[var(--bd-text-muted)]">
                {slideHtml.length === 0
                  ? "—"
                  : `${slideIndex + 1} / ${slideHtml.length}`}
              </span>
              {showSlideDots && (
                <div
                  className="flex max-w-[min(100%,14rem)] flex-wrap items-center justify-center gap-1.5"
                  role="tablist"
                  aria-label={t(uiStrings, "slideMode", "Slides")}
                >
                  {slideHtml.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === slideIndex}
                      aria-label={`${i + 1} / ${slideHtml.length}`}
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full transition-colors",
                        i === slideIndex
                          ? "bg-primary-600 dark:bg-primary-400"
                          : "bg-[var(--bd-border)] hover:bg-[var(--bd-text-muted)]",
                      )}
                      onClick={() => goToSlide(i)}
                    />
                  ))}
                </div>
              )}
              <div className="hidden h-4 w-px bg-[var(--bd-border)] sm:block" aria-hidden="true" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={slideHtml.length === 0 || slideIndex <= 0}
                onClick={() => goToSlide(0)}
                aria-label={t(uiStrings, "slideGoFirst", "First slide")}
                title={t(uiStrings, "slideGoFirst", "First slide")}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={slideHtml.length === 0 || slideIndex >= slideHtml.length - 1}
                onClick={() => goToSlide(Math.max(0, slideHtml.length - 1))}
                aria-label={t(uiStrings, "slideGoLast", "Last slide")}
                title={t(uiStrings, "slideGoLast", "Last slide")}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <div className="hidden h-4 w-px bg-[var(--bd-border)] sm:block" aria-hidden="true" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-xs text-[var(--bd-text-secondary)]"
                onClick={copySlideLink}
                title={t(uiStrings, "slideCopyLink", "Copy link to this slide")}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {slideLinkCopied
                    ? t(uiStrings, "slideLinkCopied", "Link copied")
                    : t(uiStrings, "slideCopyLink", "Copy link")}
                </span>
              </Button>
              <span className="hidden text-[10px] text-[var(--bd-text-muted)] md:inline">
                {t(uiStrings, "slideKeyboardHint", "← → · Esc")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setSlideOpen(false)}
                aria-label={t(uiStrings, "exitSlideMode", "Exit slide mode")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-y-auto pt-20">
          {slideHtml.length > 0 ? (
            <div className="bd-slide-stage-outer mx-auto w-full max-w-5xl flex-1 px-6 pb-10">
              <div
                key={slideIndex}
                className={cn(
                  "bd-slide-stage-anim w-full",
                  slideAnimDir === "next" && "bd-slide-enter-next",
                  slideAnimDir === "prev" && "bd-slide-enter-prev",
                )}
              >
                <div
                  className="bd-slide-stage prose prose-gray dark:prose-invert w-full max-w-none"
                  dangerouslySetInnerHTML={{ __html: slideHtml[slideIndex] ?? "" }}
                />
              </div>
            </div>
          ) : (
            <p className="flex flex-1 items-start justify-center px-6 pt-4 text-sm text-[var(--bd-text-muted)]">
              {t(uiStrings, "slidesEmpty", "No slide breaks — add horizontal rules (---) between sections.")}
            </p>
          )}
        </div>

        {/* Side arrows (same idea as reading mode) */}
        {slideHtml.length > 0 && (
          <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-[10052] flex items-center justify-between px-1 sm:px-3">
            <div className="pointer-events-auto">
              <button
                type="button"
                disabled={!canSlidePrev}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border border-[var(--bd-border)] bg-[var(--bd-bg)]/92 text-[var(--bd-text-muted)] shadow-[var(--bd-shadow-md)] backdrop-blur-sm transition-colors sm:h-14 sm:w-14",
                  canSlidePrev
                    ? "hover:border-primary-400/50 hover:text-primary-600 dark:hover:text-primary-400"
                    : "cursor-not-allowed opacity-35",
                )}
                aria-label={t(uiStrings, "slidePrevious", "Previous slide")}
                onClick={() => bumpSlide(-1)}
              >
                <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            <div className="pointer-events-auto">
              <button
                type="button"
                disabled={!canSlideNext}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border border-[var(--bd-border)] bg-[var(--bd-bg)]/92 text-[var(--bd-text-muted)] shadow-[var(--bd-shadow-md)] backdrop-blur-sm transition-colors sm:h-14 sm:w-14",
                  canSlideNext
                    ? "hover:border-primary-400/50 hover:text-primary-600 dark:hover:text-primary-400"
                    : "cursor-not-allowed opacity-35",
                )}
                aria-label={t(uiStrings, "slideNext", "Next slide")}
                onClick={() => bumpSlide(1)}
              >
                <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    ) : null;

  return (
    <>
      {toolbar}

      {readingOn && (prevPage || nextPage) && (
        <nav
          className="bd-reading-nav pointer-events-none fixed inset-y-0 left-0 right-0 z-[84] flex items-center justify-between px-1 sm:px-3"
          aria-label={t(uiStrings, "pageNavReading", "Page navigation")}
        >
          <div className="pointer-events-auto">
            {prevPage ? (
              <a
                href={prevPage.href}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--bd-border)] bg-[var(--bd-bg)]/92 text-[var(--bd-text-muted)] shadow-[var(--bd-shadow-md)] backdrop-blur-sm transition-colors hover:border-primary-400/50 hover:text-primary-600 sm:h-14 sm:w-14 dark:hover:text-primary-400"
                aria-label={`${t(uiStrings, "previous", "Previous")}: ${prevPage.title}`}
                title={prevPage.title}
              >
                <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2} aria-hidden="true" />
              </a>
            ) : null}
          </div>
          <div className="pointer-events-auto">
            {nextPage ? (
              <a
                href={nextPage.href}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--bd-border)] bg-[var(--bd-bg)]/92 text-[var(--bd-text-muted)] shadow-[var(--bd-shadow-md)] backdrop-blur-sm transition-colors hover:border-primary-400/50 hover:text-primary-600 sm:h-14 sm:w-14 dark:hover:text-primary-400"
                aria-label={`${t(uiStrings, "next", "Next")}: ${nextPage.title}`}
                title={nextPage.title}
              >
                <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </nav>
      )}

      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
