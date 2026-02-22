import path from "path";
import pc from "picocolors";
import fs from "fs-extra";

export async function init(dir: string): Promise<void> {
  const root = path.resolve(process.cwd(), dir);

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc init")));
  console.log();

  // Check if already a barodoc project
  const configPath = path.join(root, "barodoc.config.json");
  if (await fs.pathExists(configPath)) {
    console.log(pc.yellow("⚠ barodoc.config.json already exists."));
    console.log(pc.dim("  Run barodoc serve to start the development server."));
    console.log();
    return;
  }

  // Check if already a custom Astro project
  const hasAstroConfig =
    (await fs.pathExists(path.join(root, "astro.config.mjs"))) ||
    (await fs.pathExists(path.join(root, "astro.config.ts"))) ||
    (await fs.pathExists(path.join(root, "astro.config.js")));

  if (hasAstroConfig) {
    console.log(pc.yellow("⚠ Detected existing Astro config."));
    console.log(
      pc.dim(
        "  This looks like a full Astro project. barodoc init is for quick mode only."
      )
    );
    console.log();
    return;
  }

  // Determine project name from directory
  const projectName = path.basename(root);

  console.log(pc.dim(`Initializing barodoc in ${dir === "." ? "current directory" : dir}/`));

  // Create docs/en directory if it doesn't exist
  const docsDir = path.join(root, "docs", "en");
  const docsExists = await fs.pathExists(docsDir);

  if (!docsExists) {
    await fs.ensureDir(docsDir);

    // Create sample docs
    await fs.writeFile(
      path.join(docsDir, "introduction.md"),
      `# Introduction

Welcome to your documentation site!

## Getting Started

Edit this file at \`docs/en/introduction.md\` to customize your documentation.

## Features

- Write documentation in Markdown
- Dark mode support
- Full-text search
- i18n support
`
    );

    await fs.writeFile(
      path.join(docsDir, "quickstart.md"),
      `# Quick Start

## Development

\`\`\`bash
barodoc serve
\`\`\`

## Build

\`\`\`bash
barodoc build
\`\`\`

## Preview

\`\`\`bash
barodoc preview
\`\`\`
`
    );

    console.log(pc.green("✓ Created docs/en/introduction.md"));
    console.log(pc.green("✓ Created docs/en/quickstart.md"));
  } else {
    console.log(pc.dim("  docs/ directory already exists, skipping sample docs"));
  }

  // Create barodoc.config.json
  await fs.writeJSON(
    configPath,
    {
      name: projectName,
      navigation: [
        {
          group: "Getting Started",
          pages: ["introduction", "quickstart"],
        },
      ],
      i18n: {
        defaultLocale: "en",
        locales: ["en"],
      },
      search: {
        enabled: true,
      },
    },
    { spaces: 2 }
  );
  console.log(pc.green("✓ Created barodoc.config.json"));

  // Create public directory if it doesn't exist
  const publicDir = path.join(root, "public");
  if (!(await fs.pathExists(publicDir))) {
    await fs.ensureDir(publicDir);
    console.log(pc.green("✓ Created public/"));
  }

  // Add .barodoc/ and dist/ to .gitignore if it exists, or create one
  const gitignorePath = path.join(root, ".gitignore");
  const gitignoreEntries = [".barodoc/", "dist/", "node_modules/", ".DS_Store"];

  if (await fs.pathExists(gitignorePath)) {
    const existing = await fs.readFile(gitignorePath, "utf-8");
    const toAdd = gitignoreEntries.filter((e) => !existing.includes(e));
    if (toAdd.length > 0) {
      await fs.appendFile(gitignorePath, "\n" + toAdd.join("\n") + "\n");
      console.log(pc.green("✓ Updated .gitignore"));
    }
  } else {
    await fs.writeFile(gitignorePath, gitignoreEntries.join("\n") + "\n");
    console.log(pc.green("✓ Created .gitignore"));
  }

  console.log();
  console.log(pc.bold("Done! Your project is ready."));
  console.log();
  console.log("Next steps:");
  console.log();
  if (dir !== ".") {
    console.log(`  ${pc.cyan(`cd ${dir}`)}`);
  }
  console.log(`  ${pc.cyan("barodoc serve")}`);
  console.log();
}
