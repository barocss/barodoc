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

interface MobileNavSheetProps {
  groups: NavGroup[];
  siteName: string;
  logo?: string;
}

export function MobileNavSheet({ groups, siteName, logo }: MobileNavSheetProps) {
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
        <SheetHeader className="px-6 py-4 border-b border-[var(--color-border)]">
          <SheetTitle className="flex items-center gap-2">
            {logo && <img src={logo} alt={siteName} className="h-6 w-6" />}
            <span>{siteName}</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="px-2 py-4">
            <DocsSidebar groups={groups} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNavSheet;
