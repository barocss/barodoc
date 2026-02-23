import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
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
    <nav className={cn("space-y-5", className)}>
      {groups.map((group, index) => (
        <SidebarGroup key={index} group={group} />
      ))}
    </nav>
  );
}

function SidebarGroup({ group }: { group: NavGroup }) {
  const [isOpen, setIsOpen] = React.useState(group.defaultOpen ?? true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="group flex w-full items-center gap-1.5 py-1.5 text-[13px] font-semibold text-[var(--bd-text)] hover:text-[var(--bd-text-heading)] transition-colors">
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 text-[var(--bd-text-muted)] transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        {group.title}
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <ul className="mt-1 space-y-px border-l border-[var(--bd-border)] ml-2">
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
          "block pl-4 pr-2 py-1.5 text-[13px] rounded-r-md transition-all duration-150 -ml-px border-l-2",
          item.isActive
            ? "border-[var(--bd-sidebar-active-border)] text-[var(--bd-sidebar-active-text)] font-medium bg-[var(--bd-sidebar-active-bg)]"
            : "border-transparent text-[var(--bd-text-secondary)] hover:text-[var(--bd-text)] hover:border-[var(--bd-text-muted)]"
        )}
      >
        <span className="truncate">{item.title}</span>
      </a>
    </li>
  );
}

export default DocsSidebar;
