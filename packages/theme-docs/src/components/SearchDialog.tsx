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
}

export function SearchDialog({ className }: SearchDialogProps) {
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
        <DialogHeader className="px-4 py-3 border-b border-[var(--color-border)]">
          <DialogTitle className="sr-only">Search documentation</DialogTitle>
          <div className="flex items-center gap-3">
            <SearchIcon className="h-5 w-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-base outline-none placeholder:text-[var(--color-text-muted)]"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-[var(--color-text-muted)]">
              Esc
            </kbd>
          </div>
        </DialogHeader>
        <div className="min-h-[300px] max-h-[60vh] overflow-y-auto p-4">
          {query ? (
            <div id="pagefind-results" className="pagefind-ui" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <SearchIcon className="h-12 w-12 text-[var(--color-text-muted)] mb-4" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                Start typing to search the documentation
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs">⌘K</kbd> to open search
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SearchDialog;
