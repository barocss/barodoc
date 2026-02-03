import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

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

interface DocsSidebarProps {
  groups: NavGroup[];
  className?: string;
}

export function DocsSidebar({ groups, className }: DocsSidebarProps) {
  return (
    <ScrollArea className={cn("h-full", className)}>
      <nav className="space-y-4">
        {groups.map((group, index) => (
          <SidebarGroup key={index} group={group} />
        ))}
      </nav>
    </ScrollArea>
  );
}

function SidebarGroup({ group }: { group: NavGroup }) {
  const [isOpen, setIsOpen] = React.useState(group.defaultOpen ?? true);
  const hasActiveItem = group.items.some((item) => item.isActive);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="group flex w-full items-center gap-1.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
        <ChevronRight
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        {group.title}
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <ul className="mt-1 space-y-0.5 border-l border-[var(--color-border)] ml-1.5">
          {group.items.map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarItem({ item }: { item: NavItem }) {
  return (
    <li className="relative">
      <a
        href={item.href}
        className={cn(
          "block pl-4 pr-2 py-1.5 text-sm transition-all duration-150 -ml-px border-l-2",
          item.isActive
            ? "border-primary-500 text-primary-600 dark:text-primary-400 font-medium bg-primary-50/50 dark:bg-primary-950/30"
            : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]"
        )}
      >
        <span className="truncate">{item.title}</span>
      </a>
    </li>
  );
}

export default DocsSidebar;
