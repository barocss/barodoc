import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { cn } from "../../lib/utils";

interface TabItem {
  label: string;
  value: string;
  children: React.ReactNode;
}

interface DocTabsProps {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}

export function DocTabs({ items, defaultValue, className }: DocTabsProps) {
  const defaultTab = defaultValue || items[0]?.value;

  return (
    <Tabs defaultValue={defaultTab} className={cn("not-prose my-6", className)}>
      <TabsList className="w-full justify-start bg-[var(--color-bg-secondary)] rounded-lg p-1">
        {items.map((item) => (
          <TabsTrigger 
            key={item.value} 
            value={item.value}
            className="data-[state=active]:bg-[var(--color-bg)] data-[state=active]:shadow-sm"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent 
          key={item.value} 
          value={item.value}
          className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"
        >
          <div className="text-sm">
            {item.children}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default DocTabs;
