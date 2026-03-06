import path from "path";
import pc from "picocolors";
import { dev } from "astro";
import barodoc from "@barodoc/core";
import docsTheme from "@barodoc/theme-docs/theme";
import {
  isCustomProject,
  loadProjectConfig,
  createProject,
  findDocsDir,
} from "../runtime/project.js";

export interface ServeOptions {
  port: number;
  host?: boolean;
  open?: boolean;
  clean?: boolean;
  config?: string;
}

export async function serve(dir: string, options: ServeOptions): Promise<void> {
  // When dir is given (e.g. ../my-docs), use it as project root; otherwise cwd
  const root = !dir || dir === "."
    ? path.resolve(process.cwd())
    : path.resolve(process.cwd(), dir);

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc serve")));
  console.log();

  if (isCustomProject(root)) {
    console.log(pc.dim("Detected custom Astro project"));
    console.log(pc.dim("Running astro dev..."));
    console.log();

    const devServer = await dev({ root });
    process.on("SIGINT", async () => {
      console.log();
      console.log(pc.dim("Shutting down..."));
      await devServer.stop();
    });
    return;
  }

  console.log(pc.dim("Quick mode - creating temporary project..."));

  const docsDir = findDocsDir(root);
  const { config } = await loadProjectConfig(root, options.config);

  const projectDir = await createProject({
    root,
    docsDir,
    config,
    configPath: options.config,
  });

  console.log(pc.green("✓ Project ready"));
  console.log();

  const devServer = await dev({
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
        noExternal: [/^@barodoc\//],
      },
    },
    server: {
      port: options.port,
      host: options.host ? true : undefined,
      open: options.open,
    },
    ...(config.site ? { site: config.site } : {}),
    ...(config.base ? { base: config.base } : {}),
  });

  process.on("SIGINT", async () => {
    console.log();
    console.log(pc.dim("Shutting down..."));
    await devServer.stop();
  });
}
