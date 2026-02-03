import path from "path";
import pc from "picocolors";
import fs from "fs-extra";
import { execa } from "execa";
import {
  isCustomProject,
  loadProjectConfig,
  createProject,
  cleanupProject,
  findDocsDir,
} from "../runtime/project.js";

export interface BuildOptions {
  output: string;
  config?: string;
}

export async function build(dir: string, options: BuildOptions): Promise<void> {
  const root = path.resolve(process.cwd(), dir);
  const outputDir = path.resolve(process.cwd(), options.output);

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc build")));
  console.log();

  // Check if this is a custom project
  if (isCustomProject(root)) {
    console.log(pc.dim("Detected custom Astro project"));
    console.log(pc.dim("Running astro build..."));
    console.log();

    await runAstroBuild(root, outputDir);
    return;
  }

  // Quick mode - create temporary project
  console.log(pc.dim("Quick mode - creating temporary project..."));

  const docsDir = findDocsDir(root);
  const { config } = await loadProjectConfig(root, options.config);

  const projectDir = await createProject({
    root,
    docsDir,
    config,
    configPath: options.config,
  });

  console.log(pc.green("✓ Project created"));
  console.log();

  try {
    // Run astro build
    await runAstroBuild(projectDir, path.join(projectDir, "dist"));

    // Copy dist to output directory
    const tempDist = path.join(projectDir, "dist");
    
    if (await fs.pathExists(tempDist)) {
      await fs.ensureDir(outputDir);
      await fs.copy(tempDist, outputDir);
      console.log();
      console.log(pc.green(`✓ Build output copied to ${options.output}/`));
    }
  } finally {
    // Clean up temporary project
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

async function runAstroBuild(
  projectDir: string,
  outputDir: string
): Promise<void> {
  console.log(pc.dim("Building site..."));

  // Run astro build
  await execa("npx", ["astro", "build"], {
    cwd: projectDir,
    stdio: "inherit",
  });

  // Run pagefind for search
  console.log();
  console.log(pc.dim("Generating search index..."));

  try {
    await execa("npx", ["pagefind", "--site", "dist"], {
      cwd: projectDir,
      stdio: "inherit",
    });
  } catch {
    console.log(pc.yellow("⚠ Pagefind not available, skipping search index"));
  }
}
