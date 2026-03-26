import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import {
  findMonorepoRoot,
  findDocsDir,
  generateAstroConfigFile,
  getDefaultConfig,
  hashQuickModeDeps,
  isCustomProject,
  resolveTempPackageJsonSync,
} from "./project.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** `packages/barodoc` (runtime/ is one level below package root). */
const barodocPkgRoot = path.join(__dirname, "..", "..");

describe("quick mode package manifest", () => {
  it("findMonorepoRoot detects barodoc repo when run from packages/barodoc", () => {
    const root = findMonorepoRoot(barodocPkgRoot);
    expect(root).not.toBeNull();
    expect(fs.existsSync(path.join(root!, "pnpm-workspace.yaml"))).toBe(true);
    expect(
      fs.existsSync(path.join(root!, "packages", "barodoc", "package.json"))
    ).toBe(true);
  });

  it("findMonorepoRoot returns null outside a monorepo layout", () => {
    expect(findMonorepoRoot("/tmp")).toBeNull();
  });

  it("resolveTempPackageJsonSync omits CLI-only deps and includes astro", () => {
    const myDocs = mkdtempSync(path.join(tmpdir(), "barodoc-manifest-"));
    const projectDir = path.join(myDocs, ".barodoc");
    fs.mkdirSync(projectDir, { recursive: true });
    try {
      const monorepoRoot = findMonorepoRoot(barodocPkgRoot);
      const pkg = resolveTempPackageJsonSync(
        projectDir,
        getDefaultConfig(),
        barodocPkgRoot,
        monorepoRoot
      );
      expect(pkg.dependencies).not.toHaveProperty("cac");
      expect(pkg.dependencies).not.toHaveProperty("execa");
      expect(pkg.dependencies).not.toHaveProperty("chokidar");
      expect(pkg.dependencies).not.toHaveProperty("fs-extra");
      expect(pkg.dependencies).not.toHaveProperty("picocolors");
      expect(pkg.dependencies.astro).toBeDefined();
      expect(pkg.dependencies["@barodoc/core"]).toBeDefined();
    } finally {
      rmSync(myDocs, { recursive: true, force: true });
    }
  });

  it("resolveTempPackageJsonSync adds config plugins not in the CLI package.json", () => {
    const myDocs = mkdtempSync(path.join(tmpdir(), "barodoc-plugins-"));
    const projectDir = path.join(myDocs, ".barodoc");
    fs.mkdirSync(projectDir, { recursive: true });
    try {
      const monorepoRoot = findMonorepoRoot(barodocPkgRoot);
      const pkg = resolveTempPackageJsonSync(
        projectDir,
        {
          ...getDefaultConfig(),
          plugins: ["@barodoc/plugin-raw-md"],
        },
        barodocPkgRoot,
        monorepoRoot
      );
      expect(pkg.dependencies["@barodoc/plugin-raw-md"]).toBeDefined();
    } finally {
      rmSync(myDocs, { recursive: true, force: true });
    }
  });

  it("hashQuickModeDeps is stable and 64-char hex for the same inputs", () => {
    const myDocs = mkdtempSync(path.join(tmpdir(), "barodoc-hash-"));
    const projectDir = path.join(myDocs, ".barodoc");
    fs.mkdirSync(projectDir, { recursive: true });
    try {
      const monorepoRoot = findMonorepoRoot(barodocPkgRoot);
      const pkg = resolveTempPackageJsonSync(
        projectDir,
        getDefaultConfig(),
        barodocPkgRoot,
        monorepoRoot
      );
      const a = hashQuickModeDeps(pkg, monorepoRoot);
      const b = hashQuickModeDeps(pkg, monorepoRoot);
      expect(a).toBe(b);
      expect(a).toMatch(/^[a-f0-9]{64}$/);
    } finally {
      rmSync(myDocs, { recursive: true, force: true });
    }
  });
});

describe("generateAstroConfigFile", () => {
  it("sets preserveSymlinks false for quick/eject template", () => {
    const s = generateAstroConfigFile(getDefaultConfig());
    expect(s).toContain("preserveSymlinks: false");
  });
});

describe("findDocsDir", () => {
  it("prefers docs when present", () => {
    const d = mkdtempSync(path.join(tmpdir(), "barodoc-docsdir-"));
    fs.mkdirSync(path.join(d, "docs"), { recursive: true });
    try {
      expect(findDocsDir(d)).toBe("docs");
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });
});

describe("isCustomProject", () => {
  it("is false without astro.config", () => {
    const d = mkdtempSync(path.join(tmpdir(), "barodoc-custom-"));
    try {
      expect(isCustomProject(d)).toBe(false);
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });
});
