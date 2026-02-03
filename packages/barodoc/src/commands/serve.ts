import path from "path";
import pc from "picocolors";
import { execa } from "execa";
import {
  isCustomProject,
  loadProjectConfig,
  createProject,
  findDocsDir,
} from "../runtime/project.js";

export interface ServeOptions {
  port: number;
  host?: boolean;
  config?: string;
}

export async function serve(dir: string, options: ServeOptions): Promise<void> {
  const root = path.resolve(process.cwd(), dir);

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc serve")));
  console.log();

  // Check if this is a custom project
  if (isCustomProject(root)) {
    console.log(pc.dim("Detected custom Astro project"));
    console.log(pc.dim("Running astro dev..."));
    console.log();

    await runAstroDev(root, options);
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

  // Run astro dev in the temporary project
  await runAstroDev(projectDir, options);
}

async function runAstroDev(
  projectDir: string,
  options: ServeOptions
): Promise<void> {
  const args = ["astro", "dev"];

  if (options.port) {
    args.push("--port", String(options.port));
  }

  if (options.host) {
    args.push("--host");
  }

  try {
    await execa("npx", args, {
      cwd: projectDir,
      stdio: "inherit",
    });
  } catch (error: any) {
    if (error.signal === "SIGINT") {
      console.log();
      console.log(pc.dim("Shutting down..."));
    } else {
      throw error;
    }
  }
}
