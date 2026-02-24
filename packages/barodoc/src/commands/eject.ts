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
  generateAstroConfigFile,
} from "../runtime/project.js";

const BARODOC_DIR = ".barodoc";

export interface EjectOptions {
  config?: string;
}

export async function eject(dir: string, options: EjectOptions): Promise<void> {
  const root = path.resolve(process.cwd(), dir);

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc eject")));
  console.log();

  // Cannot eject a custom project - it already is one
  if (isCustomProject(root)) {
    console.log(pc.yellow("⚠ This is already a full Astro project."));
    console.log(pc.dim("  Nothing to eject."));
    console.log();
    return;
  }

  console.log(
    pc.dim("Ejecting to a full Astro project in the current directory...")
  );
  console.log();
  console.log(
    pc.yellow(
      "This will create astro.config.mjs, tsconfig.json, and package.json"
    )
  );
  console.log(
    pc.yellow("in the current directory. You can then run astro commands directly.")
  );
  console.log();

  // Check for conflicts
  const conflictFiles = ["astro.config.mjs", "tsconfig.json"];
  const conflicts: string[] = [];
  for (const file of conflictFiles) {
    if (await fs.pathExists(path.join(root, file))) {
      conflicts.push(file);
    }
  }

  if (conflicts.length > 0) {
    console.log(pc.red("Error: The following files already exist and would be overwritten:"));
    for (const f of conflicts) {
      console.log(`  ${pc.dim(f)}`);
    }
    console.log();
    console.log(pc.dim("Remove them first, then run barodoc eject again."));
    console.log();
    process.exit(1);
  }

  // Load config
  const docsDir = findDocsDir(root);
  const { config } = await loadProjectConfig(root, options.config);

  // Create temp project to get the generated files
  const projectDir = await createProject({
    root,
    docsDir,
    config,
    configPath: options.config,
  });

  console.log(pc.green("✓ Generated project files"));

  // --- Copy key files from .barodoc/ to root ---

  // 1. astro.config.mjs
  await fs.writeFile(
    path.join(root, "astro.config.mjs"),
    generateAstroConfigFile(config)
  );
  console.log(pc.green("✓ Created astro.config.mjs"));

  // 2. tsconfig.json
  await fs.copy(
    path.join(projectDir, "tsconfig.json"),
    path.join(root, "tsconfig.json")
  );
  console.log(pc.green("✓ Created tsconfig.json"));

  // 3. package.json with full dependency list
  const runtimeDeps: Record<string, string> = {
    astro: "^5.0.0",
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/react": "^4.0.0",
    "@barodoc/core": "latest",
    "@barodoc/theme-docs": "latest",
    "@tailwindcss/typography": "^0.5.19",
    "@tailwindcss/vite": "^4.0.0",
    tailwindcss: "^4.0.0",
    react: "^19.0.0",
    "react-dom": "^19.0.0",
  };

  const rootPkgPath = path.join(root, "package.json");

  if (await fs.pathExists(rootPkgPath)) {
    const existingPkg = await fs.readJSON(rootPkgPath);
    const merged = {
      ...existingPkg,
      type: "module",
      dependencies: {
        ...(existingPkg.dependencies ?? {}),
        ...runtimeDeps,
      },
    };
    await fs.writeJSON(rootPkgPath, merged, { spaces: 2 });
    console.log(pc.green("✓ Updated package.json (merged dependencies)"));
  } else {
    const newPkg = {
      name: path.basename(root),
      type: "module",
      private: true,
      scripts: {
        dev: "astro dev",
        build: "astro build",
        preview: "astro preview",
      },
      dependencies: runtimeDeps,
    };
    await fs.writeJSON(rootPkgPath, newPkg, { spaces: 2 });
    console.log(pc.green("✓ Created package.json"));
  }

  // 4. src/content/config.ts
  const contentConfigSrc = path.join(projectDir, "src", "content", "config.ts");
  const contentConfigDst = path.join(root, "src", "content", "config.ts");
  if (!(await fs.pathExists(contentConfigDst))) {
    await fs.ensureDir(path.dirname(contentConfigDst));
    await fs.copy(contentConfigSrc, contentConfigDst);
    console.log(pc.green("✓ Created src/content/config.ts"));
  }

  // 5. Remove .barodoc/ (no longer needed)
  await cleanupProject(root);
  console.log(pc.green("✓ Removed .barodoc/ directory"));

  // 6. Install real dependencies
  console.log();
  console.log(pc.dim("Installing dependencies..."));
  await execa("npm", ["install"], { cwd: root, stdio: "inherit" });
  console.log(pc.green("✓ Dependencies installed"));

  // 7. Update .gitignore to remove .barodoc/ entry
  const gitignorePath = path.join(root, ".gitignore");
  if (await fs.pathExists(gitignorePath)) {
    const content = await fs.readFile(gitignorePath, "utf-8");
    const updated = content
      .split("\n")
      .filter((line) => line.trim() !== ".barodoc/")
      .join("\n");
    await fs.writeFile(gitignorePath, updated);
    console.log(pc.green("✓ Updated .gitignore (removed .barodoc/ entry)"));
  }

  console.log();
  console.log(pc.bold(pc.green("Eject complete!")));
  console.log();
  console.log("You now have a full Astro project. You can run:");
  console.log();
  console.log(`  ${pc.cyan("npx astro dev")}     ${pc.dim("# development server")}`);
  console.log(`  ${pc.cyan("npx astro build")}   ${pc.dim("# production build")}`);
  console.log(`  ${pc.cyan("npx astro preview")} ${pc.dim("# preview build")}`);
  console.log();
  console.log(pc.dim("You can also install astro globally or add it as a dev dependency."));
  console.log();
}
