import * as React from "react";
import { cn } from "../../lib/utils.js";

interface MermaidProps {
  chart: string;
  className?: string;
}

export function Mermaid({ chart, className }: MermaidProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [svg, setSvg] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      try {
        // Dynamically import mermaid
        const mermaid = (await import("mermaid")).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
          securityLevel: "loose",
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        
        if (isMounted) {
          setSvg(svg);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  // Re-render on theme change
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          // Theme changed, re-render
          setSvg("");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (error) {
    return (
      <div className="not-prose my-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-4">
        <p className="text-sm text-red-600 dark:text-red-400">
          Mermaid diagram error: {error}
        </p>
        <pre className="mt-2 text-xs text-red-500 overflow-auto">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={cn("not-prose my-4 flex items-center justify-center p-8 bg-[var(--color-bg-secondary)] rounded-lg", className)}>
        <div className="text-sm text-[var(--color-text-muted)]">Loading diagram...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("not-prose my-4 flex justify-center overflow-x-auto rounded-lg bg-[var(--color-bg)] p-4", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
