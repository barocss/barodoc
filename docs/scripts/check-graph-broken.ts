/**
 * Fail with exit code 1 if the content graph has unresolved internal links.
 * Run from repo root: `pnpm --filter docs run check:graph`
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "@barodoc/core";
import { buildWikiGraph } from "@barodoc/theme-docs/lib/wikiGraph.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");

async function main(): Promise<void> {
  const config = await loadConfig("barodoc.config.json", docsRoot);
  const graph = buildWikiGraph(docsRoot, config);
  const broken = graph.broken ?? [];
  if (broken.length === 0) {
    console.log("graph: OK (no unresolved internal links)");
    process.exit(0);
  }
  console.error(`graph: ${broken.length} unresolved internal link(s)`);
  for (const b of broken) {
    console.error(`  ${b.from}  [${b.kind}]  ${b.raw}`);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
