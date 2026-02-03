import * as React from "react";

interface CodeGroupProps {
  children: React.ReactNode;
  titles?: string[];
}

function isCodeBlockLike(el: React.ReactElement): boolean {
  if (el.type === "pre") return true;
  const className =
    typeof el.props?.className === "string" ? el.props.className : "";
  if (
    className.includes("language-") ||
    className.includes("astro-code") ||
    className.includes("code-block")
  )
    return true;
  return false;
}

function collectCodeBlocks(node: React.ReactNode): React.ReactElement[] {
  const result: React.ReactElement[] = [];
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment && child.props?.children != null) {
      result.push(...collectCodeBlocks(child.props.children));
      return;
    }
    if (child.type === "pre" || isCodeBlockLike(child)) {
      result.push(child);
      return;
    }
    if (child.props?.children != null) {
      result.push(...collectCodeBlocks(child.props.children));
    }
  });
  return result;
}

export function CodeGroup({ children, titles = [] }: CodeGroupProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const codeBlocks = React.useMemo(() => {
    let blocks = collectCodeBlocks(children);
    if (blocks.length > 0) return blocks;
    const direct = React.Children.toArray(children).filter(
      (c): c is React.ReactElement => React.isValidElement(c) && c.type != null
    );
    if (direct.length > 1) return direct;
    if (
      direct.length === 1 &&
      direct[0].props?.children != null
    ) {
      const inner = React.Children.toArray(direct[0].props.children).filter(
        (c): c is React.ReactElement =>
          React.isValidElement(c) && c.type != null
      );
      if (inner.length > 0) return inner;
    }
    return direct;
  }, [children]);

  const tabTitles =
    titles.length >= codeBlocks.length
      ? titles.slice(0, codeBlocks.length)
      : [
          ...titles,
          ...codeBlocks
            .slice(titles.length)
            .map((_, i) => `Tab ${titles.length + i + 1}`),
        ];

  if (codeBlocks.length === 0) {
    return (
      <div className="code-group not-prose my-4 rounded-lg border border-[var(--color-border)] overflow-hidden p-4 text-[var(--color-text-muted)] text-sm">
        No code blocks found inside CodeGroup.
      </div>
    );
  }

  return (
    <div className="code-group not-prose my-4 rounded-lg border border-[var(--color-border)] overflow-hidden">
      {/* Tabs */}
      <div className="flex flex-wrap gap-0 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)]">
        {tabTitles.map((title, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
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
