import * as React from "react";

interface CodeGroupProps {
  children: React.ReactNode;
  titles?: string[];
}

export function CodeGroup({ children, titles = [] }: CodeGroupProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  // Extract code blocks from children
  const codeBlocks = React.Children.toArray(children);
  
  return (
    <div className="not-prose my-4 rounded-lg border border-[var(--color-border)] overflow-hidden">
      {/* Tabs */}
      <div className="flex bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)]">
        {codeBlocks.map((_, index) => {
          const isActive = activeIndex === index;
          const title = titles[index] || `Tab ${index + 1}`;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-b-2 border-primary-500 -mb-px"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {title}
            </button>
          );
        })}
      </div>
      
      {/* Content */}
      <div className="bg-[var(--color-bg-secondary)]">
        {codeBlocks.map((block, index) => (
          <div
            key={index}
            style={{ display: activeIndex === index ? "block" : "none" }}
          >
            {block}
          </div>
        ))}
      </div>
    </div>
  );
}
