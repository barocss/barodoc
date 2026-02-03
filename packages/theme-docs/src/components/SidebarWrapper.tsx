import * as React from "react";
import { DocsSidebar } from "./DocsSidebar";

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

interface SidebarWrapperProps {
  groups: NavGroup[];
}

export function SidebarWrapper({ groups }: SidebarWrapperProps) {
  return <DocsSidebar groups={groups} />;
}

export default SidebarWrapper;
