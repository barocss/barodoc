import path from "path";
import pc from "picocolors";
import fs from "fs-extra";
import { execa } from "execa";

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

  // Check if dist exists
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

  // Use a simple static server
  try {
    await execa(
      "npx",
      ["serve", distDir, "-l", String(options.port)],
      {
        stdio: "inherit",
      }
    );
  } catch (error: any) {
    if (error.signal === "SIGINT") {
      console.log();
      console.log(pc.dim("Shutting down..."));
    } else {
      throw error;
    }
  }
}
