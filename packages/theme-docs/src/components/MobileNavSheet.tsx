import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { DocsSidebar } from "./DocsSidebar";
import { cn } from "../lib/utils";

interface NavItem {
  title: string;
  href: string;
  isActive?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface TabItem {
  label: string;
  href: string;
}

interface MobileNavSheetProps {
  groups: NavGroup[];
  siteName: string;
  logo?: string;
  tabs?: TabItem[];
  currentPath?: string;
}

export function MobileNavSheet({ groups, siteName, logo, tabs = [], currentPath = "" }: MobileNavSheetProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleToggle = () => setOpen((prev) => !prev);
    document.addEventListener("toggle-mobile-nav", handleToggle);
    return () => document.removeEventListener("toggle-mobile-nav", handleToggle);
  }, []);

  // Close on navigation
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a")) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="px-6 py-4 border-b border-[var(--bd-border)]">
          <SheetTitle className="flex items-center gap-2">
            {logo && <img src={logo} alt={siteName} className="h-6 w-6" />}
            <span>{siteName}</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-65px)]">
          {tabs.length > 0 && (
            <div className="px-4 pt-4 pb-2 flex flex-col gap-1 border-b border-[var(--bd-border)]">
              {tabs.map((tab) => {
                const isActive = currentPath === tab.href || currentPath.startsWith(tab.href + "/");
                return (
                  <a
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50"
                        : "text-[var(--bd-text-secondary)] hover:text-[var(--bd-text)] hover:bg-[var(--bd-bg-subtle)]"
                    )}
                  >
                    {tab.label}
                  </a>
                );
              })}
            </div>
          )}
          <div className="px-2 py-4">
            <DocsSidebar groups={groups} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNavSheet;
