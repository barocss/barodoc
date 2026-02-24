import path from "path";
import pc from "picocolors";
import fs from "fs-extra";
import { preview as astroPreview } from "astro";

export interface PreviewOptions {
  port: number;
  output: string;
}

export async function preview(
  dir: string,
  options: PreviewOptions
): Promise<void> {
  const root = path.resolve(process.cwd(), dir);
  const distDir = path.resolve(root, options.output);

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc preview")));
  console.log();

  if (!(await fs.pathExists(distDir))) {
    console.log(
      pc.red(`Error: Build directory not found: ${options.output}/`)
    );
    console.log();
    console.log(`Run ${pc.cyan("barodoc build")} first to create a build.`);
    console.log();
    process.exit(1);
  }

  console.log(pc.dim(`Serving from ${options.output}/`));
  console.log();

  const previewServer = await astroPreview({
    root,
    server: {
      port: options.port,
    },
  });

  process.on("SIGINT", async () => {
    console.log();
    console.log(pc.dim("Shutting down..."));
    await previewServer.stop();
  });
}
