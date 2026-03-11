import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { cn } from "../lib/utils";

interface SearchDialogProps {
  className?: string;
  searchPlaceholder?: string;
  noResults?: string;
  searchIndexNotAvailable?: string;
}

const DEFAULT_PLACEHOLDER = "Search documentation...";
const DEFAULT_NO_RESULTS = "No results found";
const DEFAULT_INDEX_UNAVAILABLE = "Search index not available";

export function SearchDialog({
  className,
  searchPlaceholder = DEFAULT_PLACEHOLDER,
  noResults = DEFAULT_NO_RESULTS,
  searchIndexNotAvailable = DEFAULT_INDEX_UNAVAILABLE,
}: SearchDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const handleToggle = () => setOpen((prev) => !prev);
    document.addEventListener("toggle-search", handleToggle);
    
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    
    return () => {
      document.removeEventListener("toggle-search", handleToggle);
      document.removeEventListener("keydown", down);
    };
  }, []);

  React.useEffect(() => {
    if (open && typeof window !== "undefined" && (window as any).pagefind) {
      // Initialize pagefind when dialog opens
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={cn("sm:max-w-2xl p-0 gap-0", className)}>
        <DialogHeader className="px-4 py-3 border-b border-[var(--bd-border)]">
          <DialogTitle className="sr-only">{searchPlaceholder}</DialogTitle>
          <div className="flex items-center gap-3">
            <SearchIcon className="h-5 w-5 text-[var(--bd-text-muted)]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-base outline-none placeholder:text-[var(--bd-text-muted)]"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[var(--bd-bg-subtle)] border border-[var(--bd-border)] rounded text-[var(--bd-text-muted)]">
              Esc
            </kbd>
          </div>
        </DialogHeader>
        <div className="min-h-[300px] max-h-[60vh] overflow-y-auto p-4">
          {query ? (
            <div id="pagefind-results" className="pagefind-ui" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <SearchIcon className="h-12 w-12 text-[var(--bd-text-muted)] mb-4" />
              <p className="text-sm text-[var(--bd-text-secondary)]">
                Start typing to search the documentation
              </p>
              <p className="text-xs text-[var(--bd-text-muted)] mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-[var(--bd-bg-subtle)] border border-[var(--bd-border)] rounded text-xs">⌘K</kbd> to open search
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SearchDialog;
