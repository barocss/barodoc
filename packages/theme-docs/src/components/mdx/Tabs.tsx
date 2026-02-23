import * as React from "react";

interface TabItem {
  label: string;
  value: string;
  children: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
}

export function Tabs({ items, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || items[0]?.value);

  return (
    <div className="not-prose my-4">
      <div className="flex border-b border-[var(--bd-border)]">
        {items.map((item) => {
          const isActive = activeTab === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setActiveTab(item.value)}
              style={{ cursor: 'pointer' }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 -mb-px"
                  : "text-[var(--bd-text-muted)] hover:text-[var(--bd-text)]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="pt-3">
        {items.map((item) => {
          const isActive = activeTab === item.value;
          if (!isActive) return null;
          return (
            <div key={item.value}>
              <pre className="bg-[var(--bd-bg-code)] border border-[var(--bd-border)] rounded-md p-3 text-sm overflow-x-auto">
                <code>{item.children}</code>
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TabProps {
  label: string;
  value: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}
