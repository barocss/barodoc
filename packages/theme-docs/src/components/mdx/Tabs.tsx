import { useState, type ReactNode } from "react";

interface TabItem {
  label: string;
  value: string;
  children: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
}

export function Tabs({ items, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || items[0]?.value);

  return (
    <div className="not-prose my-4">
      <div className="flex border-b border-[var(--color-border)]">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => setActiveTab(item.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === item.value
                ? "border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {items.map((item) => (
          <div
            key={item.value}
            className={activeTab === item.value ? "block" : "hidden"}
          >
            {item.children}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TabProps {
  label: string;
  value: string;
  children: ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}
