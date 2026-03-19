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
  /** Nested items (only these expand/collapse, not the group) */
  children?: NavItem[];
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
    <nav className={cn("space-y-7", className)}>
      {groups.map((group, index) => (
        <SidebarGroup key={index} group={group} />
      ))}
    </nav>
  );
}

/** Group is always visible (no collapse). Only items with children expand/collapse. */
function SidebarGroup({ group }: { group: NavGroup }) {
  return (
    <div>
      <div className="py-1 text-[14px] font-bold text-[var(--bd-text)]">
        <span className="truncate">{group.title}</span>
      </div>
      <ul className="mt-2 space-y-1">
        {group.items.map((item, index) => (
          <SidebarItem key={index} item={item} depth={0} />
        ))}
      </ul>
    </div>
  );
}

function SidebarItem({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const hasChildren = item.children && item.children.length > 0;
  const [open, setOpen] = React.useState(true);

  if (hasChildren) {
    return (
      <li>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex w-full items-center py-1.5 px-2 text-[14px] rounded-md transition-colors font-normal text-[var(--bd-text-secondary)] hover:text-[var(--bd-text)]">
            <span className="truncate flex-1 text-left">{item.title}</span>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-[var(--bd-text-muted)] transition-transform duration-200 shrink-0 ml-1",
                open && "rotate-90"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-1 space-y-1 pl-4">
              {item.children!.map((child, i) => (
                <SidebarItem key={i} item={child} depth={depth + 1} />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </li>
    );
  }

  return (
    <li>
      <a
        href={item.href}
        className={cn(
          "block py-1.5 px-2 text-[14px] rounded-md transition-colors",
          depth > 0 && "pl-2",
          item.isActive
            ? "font-semibold text-[var(--bd-sidebar-active-text)] bg-[var(--bd-sidebar-active-bg)]"
            : "font-normal text-[var(--bd-text-secondary)] hover:text-[var(--bd-text)]"
        )}
      >
        <span className="truncate">{item.title}</span>
      </a>
    </li>
  );
}

export default DocsSidebar;
