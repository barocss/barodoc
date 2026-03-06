import fs from "node:fs";
import path from "node:path";
import { isAssetExtension } from "./assetExtensions.js";

export interface AssetEntry {
  slug: string;
  relPath: string;
  ext: string;
  sectionSlug: string;
}

export function scanSectionAssets(
  sectionDir: string,
  sectionSlug: string,
  _baseDir: string = sectionDir
): AssetEntry[] {
  if (!fs.existsSync(sectionDir)) return [];
  const entries: AssetEntry[] = [];
  const stack: string[] = [""];
  while (stack.length) {
    const rel = stack.pop()!;
    const full = path.join(sectionDir, rel);
    if (!fs.existsSync(full)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const names = fs.readdirSync(full);
      for (const name of names) {
        if (name.startsWith(".")) continue;
        stack.push(rel ? `${rel}/${name}` : name);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(rel).toLowerCase();
      if (isAssetExtension(ext)) {
        const slug = rel.slice(0, -ext.length).replace(/\\/g, "/");
        entries.push({
          slug,
          relPath: rel.replace(/\\/g, "/"),
          ext,
          sectionSlug,
        });
      }
    }
  }
  return entries;
}

export function getContentSectionsBasePath(): string {
  const root = process.cwd();
  return path.join(root, "src", "content");
}
