/// <reference types="vite/client" />
import { useEffect, useRef, useState } from "react";
import type { WikiGraphJson } from "../../lib/wikiGraph.js";

interface WikiGraphViewProps {
  /** `?focus=` — doc id or href path; highlights that page and its wiki neighbors */
  focus?: string;
}

function matchSeed(
  n: WikiGraphJson["nodes"][0],
  focusRaw: string,
): boolean {
  const f = decodeURIComponent(focusRaw).trim();
  const norm = (s: string) => s.replace(/^\/+|\/+$/g, "");
  return (
    n.id === f ||
    n.href === f ||
    norm(n.href) === norm(f) ||
    norm(n.href).endsWith("/" + norm(f)) ||
    norm(f).endsWith(n.id)
  );
}

/** Seed nodes matching `focus` plus one hop along edges. */
function collectFocusNeighborhood(
  data: WikiGraphJson,
  focusRaw: string | undefined,
): { seeds: Set<string>; neighborhood: Set<string> } {
  const seeds = new Set<string>();
  if (!focusRaw?.trim()) {
    return { seeds, neighborhood: new Set() };
  }
  for (const n of data.nodes) {
    if (matchSeed(n, focusRaw)) seeds.add(n.id);
  }
  const out = new Set(seeds);
  for (const e of data.edges) {
    if (seeds.has(e.from)) out.add(e.to);
    if (seeds.has(e.to)) out.add(e.from);
  }
  return { seeds, neighborhood: out };
}

export function WikiGraphView({ focus }: WikiGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ nodes: number; edges: number } | null>(
    null,
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    /** Sigma instance — typed loosely because it is loaded only in the browser via dynamic import. */
    let sigmaInst: { kill: () => void } | null = null;

    const run = async () => {
      setError(null);
      const base = import.meta.env.BASE_URL || "/";
      const url = `${base}graph.json`.replace(/([^:]\/)\/+/g, "$1");

      let data: WikiGraphJson;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        data = (await res.json()) as WikiGraphJson;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load graph.json",
        );
        return;
      }

      setMeta({ nodes: data.nodes.length, edges: data.edges.length });

      if (data.nodes.length === 0) {
        setError("No pages in graph.");
        return;
      }

      const [{ default: Graph }, { default: Sigma }, fa2, randomMod] =
        await Promise.all([
          import("graphology"),
          import("sigma"),
          import("graphology-layout-forceatlas2"),
          import("graphology-layout/random"),
        ]);
      const forceAtlas2 = fa2.default;
      const random = randomMod.default;

      const g = new Graph({ type: "directed", multi: false });
      const dark = document.documentElement.classList.contains("dark");
      const nodeColor = dark ? "#94a3b8" : "#475569";
      const edgeColor = dark ? "#475569" : "#94a3b8";
      const focusRing = "#38bdf8";
      const dimColor = dark ? "#1e293b" : "#e2e8f0";

      const { seeds, neighborhood } = collectFocusNeighborhood(data, focus);
      const hasFocus = neighborhood.size > 0;

      for (const n of data.nodes) {
        const inFocus = !hasFocus || neighborhood.has(n.id);
        const isSeed = seeds.has(n.id);
        g.addNode(n.id, {
          label: n.title,
          size: inFocus ? 7 : 4,
          color: !inFocus
            ? dimColor
            : isSeed
              ? focusRing
              : nodeColor,
        });
      }

      for (const e of data.edges) {
        if (!g.hasNode(e.from) || !g.hasNode(e.to)) continue;
        const fe =
          !hasFocus ||
          (neighborhood.has(e.from) && neighborhood.has(e.to));
        try {
          g.addEdge(e.from, e.to, {
            size: fe ? 1 : 0.35,
            color: fe ? edgeColor : dimColor,
          });
        } catch {
          /* duplicate */
        }
      }

      random.assign(g);

      forceAtlas2.assign(g, {
        iterations: Math.min(160, 40 + data.nodes.length * 2),
        settings: {
          gravity: 8,
          scalingRatio: 10,
          barnesHutOptimize: true,
        },
      });

      const sigma = new Sigma(g, el, {
        allowInvalidContainer: true,
        labelDensity: 0.06,
        labelGridCellSize: 60,
        renderEdgeLabels: false,
        defaultEdgeType: "line",
      });
      sigmaInst = sigma;

      sigma.on("clickNode", ({ node }: { node: string }) => {
        const n = data.nodes.find((x) => x.id === node);
        if (n?.href) {
          window.location.href = n.href;
        }
      });
    };

    void run();

    return () => {
      sigmaInst?.kill();
      el.innerHTML = "";
    };
  }, [focus]);

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {meta && !error && (
        <p className="text-xs text-[var(--bd-text-secondary)]">
          {meta.nodes} pages · {meta.edges} links (wiki + MD + anchors) · drag
          to pan · wheel to
          zoom · click a node to open
        </p>
      )}
      <div
        ref={containerRef}
        className="w-full h-[min(70vh,560px)] rounded-lg border border-[var(--bd-border)] bg-[var(--bd-bg-surface)]"
        aria-label="Documentation graph"
      />
    </div>
  );
}
