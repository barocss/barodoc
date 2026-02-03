#!/usr/bin/env node

import path from "path";
import pc from "picocolors";
import fs from "fs-extra";

async function main() {
  console.log();
  console.log(pc.bold(pc.cyan("  create-barodoc")));
  console.log(pc.dim("  Documentation framework powered by Astro"));
  console.log();

  // Get project name from args
  const name = process.argv[2];

  if (!name) {
    console.log(pc.red("Error: Please provide a project name"));
    console.log();
    console.log("Usage:");
    console.log(`  ${pc.cyan("pnpm create barodoc <project-name>")}`);
    console.log();
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), name);

  // Check if directory exists
  if (await fs.pathExists(targetDir)) {
    console.log(pc.red(`Error: Directory "${name}" already exists.`));
    process.exit(1);
  }

  console.log(pc.dim(`Creating project in ${name}/`));

  // Create directory structure
  await fs.ensureDir(path.join(targetDir, "docs/en"));
  await fs.ensureDir(path.join(targetDir, "public"));

  // Create barodoc.config.json
  await fs.writeJSON(
    path.join(targetDir, "barodoc.config.json"),
    {
      name: name,
      logo: "/logo.svg",
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
      topbar: {
        github: "",
      },
    },
    { spaces: 2 }
  );

  // Create sample docs
  await fs.writeFile(
    path.join(targetDir, "docs/en/introduction.md"),
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
    path.join(targetDir, "docs/en/quickstart.md"),
    `# Quick Start

## Development

\`\`\`bash
npx barodoc serve
\`\`\`

## Build

\`\`\`bash
npx barodoc build
\`\`\`

## Preview

\`\`\`bash
npx barodoc preview
\`\`\`
`
  );

  // Create logo
  await fs.writeFile(
    path.join(targetDir, "public/logo.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
  <rect x="10" y="20" width="80" height="60" rx="8" fill="currentColor" opacity="0.1"/>
  <rect x="18" y="32" width="40" height="4" rx="2" fill="currentColor"/>
  <rect x="18" y="42" width="64" height="3" rx="1.5" fill="currentColor" opacity="0.5"/>
  <rect x="18" y="50" width="56" height="3" rx="1.5" fill="currentColor" opacity="0.5"/>
  <rect x="18" y="58" width="48" height="3" rx="1.5" fill="currentColor" opacity="0.5"/>
</svg>
`
  );

  // Create .gitignore
  await fs.writeFile(
    path.join(targetDir, ".gitignore"),
    `.barodoc/
dist/
node_modules/
.DS_Store
`
  );

  console.log(pc.green("✓ Project created!"));
  console.log();
  console.log("Next steps:");
  console.log();
  console.log(`  ${pc.cyan(`cd ${name}`)}`);
  console.log(`  ${pc.cyan("npx barodoc serve")}`);
  console.log();
  console.log(pc.dim("No npm install needed! Just run the commands above."));
  console.log();
}

main().catch((err) => {
  console.error(pc.red("Error:"), err);
  process.exit(1);
});
