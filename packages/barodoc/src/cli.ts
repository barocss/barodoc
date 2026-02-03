#!/usr/bin/env node

import cac from "cac";
import pc from "picocolors";
import { version } from "../package.json";
import { serve } from "./commands/serve.js";
import { build } from "./commands/build.js";
import { create } from "./commands/create.js";
import { preview } from "./commands/preview.js";

const cli = cac("barodoc");

cli
  .command("serve [dir]", "Start development server")
  .option("-p, --port <port>", "Port to listen on", { default: 4321 })
  .option("-h, --host", "Expose to network")
  .option("-c, --config <file>", "Config file path")
  .action(async (dir: string = ".", options) => {
    await serve(dir, options);
  });

cli
  .command("build [dir]", "Build for production")
  .option("-o, --output <dir>", "Output directory", { default: "dist" })
  .option("-c, --config <file>", "Config file path")
  .action(async (dir: string = ".", options) => {
    await build(dir, options);
  });

cli
  .command("preview [dir]", "Preview production build")
  .option("-p, --port <port>", "Port to listen on", { default: 4321 })
  .option("-o, --output <dir>", "Build output directory", { default: "dist" })
  .action(async (dir: string = ".", options) => {
    await preview(dir, options);
  });

cli
  .command("create <name>", "Create a new Barodoc project")
  .action(async (name: string) => {
    await create(name);
  });

cli.help();
cli.version(version);

cli.parse();

// Show help if no command
if (!process.argv.slice(2).length) {
  console.log();
  console.log(pc.bold(pc.cyan("  barodoc")));
  console.log(pc.dim("  Documentation framework powered by Astro"));
  console.log();
  cli.outputHelp();
}
