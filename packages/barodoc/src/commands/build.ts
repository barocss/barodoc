import path from "path";
import pc from "picocolors";
import fs from "fs-extra";
import { execa } from "execa";
import { build as astroBuild } from "astro";
import barodoc from "@barodoc/core";
import docsTheme from "@barodoc/theme-docs/theme";
import {
  isCustomProject,
  loadProjectConfig,
  createProject,
  cleanupProject,
  findDocsDir,
} from "../runtime/project.js";

export interface BuildOptions {
  output: string;
  clean?: boolean;
  config?: string;
}

export async function build(dir: string, options: BuildOptions): Promise<void> {
  const root = path.resolve(process.cwd());
  const outputDir = path.resolve(process.cwd(), options.output);

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc build")));
  console.log();

  if (isCustomProject(root)) {
    console.log(pc.dim("Detected custom Astro project"));
    console.log(pc.dim("Running astro build..."));
    console.log();

    await astroBuild({ root });
    return;
  }

  console.log(pc.dim("Quick mode - creating temporary project..."));

  const docsDir =
    !dir || dir === "." ? findDocsDir(root) : path.resolve(root, dir);
  const { config } = await loadProjectConfig(root, options.config);

  const projectDir = await createProject({
    root,
    docsDir,
    config,
    configPath: options.config,
  });

  console.log(pc.green("✓ Project ready"));
  console.log();

  try {
    console.log(pc.dim("Building site..."));

    await astroBuild({
      root: projectDir,
      configFile: false,
      integrations: [
        barodoc({
          config: "./barodoc.config.json",
          theme: docsTheme(),
        }),
      ],
      vite: {
        resolve: {
          preserveSymlinks: true,
        },
        ssr: {
          noExternal: true,
        },
      },
      logLevel: "info",
      ...(config.site ? { site: config.site } : {}),
      ...(config.base ? { base: config.base } : {}),
    });

    console.log();
    console.log(pc.dim("Generating search index..."));
    try {
      await execa("npx", ["pagefind", "--site", "dist"], {
        cwd: projectDir,
        stdio: "inherit",
      });
    } catch {
      console.log(
        pc.yellow("⚠ Pagefind not available, skipping search index")
      );
    }

    const tempDist = path.join(projectDir, "dist");

    if (await fs.pathExists(tempDist)) {
      await fs.ensureDir(outputDir);
      await fs.copy(tempDist, outputDir);
      console.log();
      console.log(pc.green(`✓ Build output copied to ${options.output}/`));
    }
  } finally {
    console.log(pc.dim("Cleaning up..."));
    await cleanupProject(root);
  }

  console.log();
  console.log(pc.green("Build complete!"));
  console.log();
  console.log(`  ${pc.dim("Output:")} ${outputDir}`);
  console.log(`  ${pc.dim("Preview:")} barodoc preview ${dir}`);
  console.log();
}
