import path from "path";
import pc from "picocolors";
import fs from "fs-extra";
import { zodToJsonSchema } from "zod-to-json-schema";
import { barodocConfigSchema, docsFrontmatterSchema } from "@barodoc/core";

interface SchemaOptions {
  output?: string;
}

export async function schema(dir: string, options: SchemaOptions): Promise<void> {
  const root = path.resolve(process.cwd(), dir);
  const outDir = options.output ? path.resolve(root, options.output) : root;

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc schema")));
  console.log();

  await fs.ensureDir(outDir);

  const configSchema = zodToJsonSchema(barodocConfigSchema, {
    name: "BarodocConfig",
    $refStrategy: "none",
  });

  const fmSchema = zodToJsonSchema(docsFrontmatterSchema, {
    name: "DocsFrontmatter",
    $refStrategy: "none",
  });

  const configPath = path.join(outDir, "config-schema.json");
  const fmPath = path.join(outDir, "frontmatter-schema.json");

  await fs.writeJSON(configPath, configSchema, { spaces: 2 });
  await fs.writeJSON(fmPath, fmSchema, { spaces: 2 });

  console.log(pc.green(`  ✓ Generated ${path.relative(root, configPath)}`));
  console.log(pc.green(`  ✓ Generated ${path.relative(root, fmPath)}`));
  console.log();
}
