import * as React from "react";

const BASE_URL = "https://cdn.jsdelivr.net/npm/latex.js@0.12.1/dist/";

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function showFallback(
  root: HTMLDivElement,
  url: string,
  tex: string,
  reason: string
) {
  root.innerHTML = `
    <p class="text-red-600 dark:text-red-400 font-medium">LaTeX could not be rendered in the browser.</p>
    <p class="text-sm text-[var(--bd-text-secondary)] mt-2">${escapeHtml(reason)}</p>
    <p class="mt-4"><a href="${escapeHtml(url)}" download class="text-primary-600 dark:text-primary-400 hover:underline">Download .tex file</a></p>
    <details class="mt-4"><summary class="cursor-pointer text-sm text-[var(--bd-text-secondary)]">Show source</summary>
    <pre class="mt-2 p-4 bg-[var(--bd-bg-secondary)] rounded text-xs overflow-x-auto whitespace-pre-wrap">${escapeHtml(tex)}</pre>
    </details>`;
}

interface TexViewerProps {
  url: string;
}

export function TexViewer({ url }: TexViewerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const cleanupRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || !url) return;

    let tex = "";
    let hasRendered = false;

    const cleanup = () => {
      window.removeEventListener("unhandledrejection", onRejection);
      cleanupRef.current = null;
    };
    cleanupRef.current = cleanup;

    const onRejection = (e: PromiseRejectionEvent) => {
      if (hasRendered) return;
      const stack = e.reason?.stack ?? "";
      const fromLaTeX =
        stack.includes("latex.component") ||
        stack.includes("types.ls") ||
        stack.includes("generator.ls") ||
        String(e.reason).toLowerCase().includes("latex");
      if (e.reason && fromLaTeX) {
        e.preventDefault();
        cleanup();
        showFallback(
          root,
          url,
          tex,
          "LaTeX.js threw an error during parsing (browser engine has limited support)."
        );
      }
    };

    (async () => {
      try {
        const mod = await import("latex.js/dist/latex.component.esm.js");
        const LaTeXJSComponent = mod.default as CustomElementConstructor;
        if (!LaTeXJSComponent) throw new Error("LaTeX component not found");

        if (!customElements.get("latex-js")) {
          customElements.define("latex-js", LaTeXJSComponent);
        }

        const res = await fetch(url);
        tex = await res.text();
        window.addEventListener("unhandledrejection", onRejection);

        const el = document.createElement("latex-js");
        el.setAttribute("baseURL", BASE_URL);
        el.textContent = tex;
        root.appendChild(el);

        setTimeout(() => {
          if (cleanupRef.current !== cleanup) return;
          const latexEl = root.querySelector("latex-js");
          const hasContent =
            latexEl?.shadowRoot?.innerText?.trim() ||
            (latexEl?.shadowRoot?.querySelector("div")?.innerHTML?.length ?? 0) > 0 ||
            root.innerText?.trim();
          if (hasContent) {
            hasRendered = true;
          } else {
            cleanup();
            showFallback(
              root,
              url,
              tex,
              "LaTeX.js did not produce output (unsupported commands or browser limitation)."
            );
          }
        }, 3000);
      } catch (e) {
        showFallback(
          root,
          url,
          tex || "(could not load file)",
          e instanceof Error ? e.message : String(e)
        );
      }
    })();

    return () => {
      cleanup();
    };
  }, [url]);

  return (
    <div
      ref={rootRef}
      className="prose prose-sm dark:prose-invert max-w-none"
      data-url={url}
    />
  );
}
