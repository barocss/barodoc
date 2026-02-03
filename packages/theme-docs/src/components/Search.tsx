import { useEffect, useState, useRef, useCallback } from "react";

interface SearchResult {
  url: string;
  meta: {
    title: string;
  };
  excerpt: string;
}

// Pagefind loader - only runs on client side
async function loadPagefind() {
  if (typeof window === "undefined") return null;
  
  try {
    // @ts-expect-error - Pagefind exposes itself on window when loaded
    if (window.pagefind) {
      // @ts-expect-error
      return window.pagefind;
    }
    
    // Dynamic import using Function constructor to avoid Vite bundling
    const pagefindPath = "/pagefind/pagefind.js";
    const pagefind = await new Function(`return import("${pagefindPath}")`)();
    await pagefind.init();
    // @ts-expect-error
    window.pagefind = pagefind;
    return pagefind;
  } catch (e) {
    console.warn("Pagefind not available:", e);
    return null;
  }
}

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pagefind, setPagefind] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Load Pagefind
  useEffect(() => {
    loadPagefind().then(setPagefind);
  }, []);

  // Listen for toggle-search event
  useEffect(() => {
    const handler = () => setIsOpen(true);
    document.addEventListener("toggle-search", handler);
    return () => document.removeEventListener("toggle-search", handler);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search with debounce
  const search = useCallback(
    async (searchQuery: string) => {
      if (!pagefind || !searchQuery.trim()) {
        setResults([]);
        return;
      }
      try {
        const searchResults = await pagefind.search(searchQuery);
        const data = await Promise.all(
          searchResults.results.slice(0, 8).map((r: any) => r.data())
        );
        setResults(data);
        setSelectedIndex(0);
      } catch (e) {
        console.error("Search error:", e);
        setResults([]);
      }
    },
    [pagefind]
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 150);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Navigate results with keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      window.location.href = results[selectedIndex].url;
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full"
      onClick={(e) => {
        if (e.target === dialogRef.current) setIsOpen(false);
      }}
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg">
        <div className="bg-[var(--color-bg)] rounded-xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
          <div className="flex items-center px-4 border-b border-[var(--color-border)]">
            <svg
              className="w-5 h-5 text-[var(--color-text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search documentation..."
              className="flex-1 px-4 py-4 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded"
            >
              ESC
            </button>
          </div>

          {query.trim() && (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                  {pagefind ? "No results found" : "Search index not available"}
                </div>
              ) : (
                <ul>
                  {results.map((result, index) => (
                    <li key={result.url}>
                      <a
                        href={result.url}
                        className={`block px-4 py-3 transition-colors ${
                          index === selectedIndex
                            ? "bg-primary-50 dark:bg-primary-900/30"
                            : "hover:bg-[var(--color-bg-secondary)]"
                        }`}
                      >
                        <div className="font-medium text-[var(--color-text)]">
                          {result.meta.title}
                        </div>
                        <div
                          className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-0.5"
                          dangerouslySetInnerHTML={{ __html: result.excerpt }}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!query.trim() && (
            <div className="px-4 py-6 text-center text-[var(--color-text-secondary)] text-sm">
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
