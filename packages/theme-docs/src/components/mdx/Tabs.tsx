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
      <div className="flex border-b border-[var(--color-border)]">
        {items.map((item) => {
          const isActive = activeTab === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                console.log('Tab clicked:', item.value);
                setActiveTab(item.value);
              }}
              style={{ cursor: 'pointer' }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-blue-600 text-blue-600 -mb-px"
                  : "text-gray-500 hover:text-gray-900"
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
              <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3 text-sm overflow-x-auto">
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
