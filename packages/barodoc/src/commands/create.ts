import path from "path";
import pc from "picocolors";
import fs from "fs-extra";
import { generateAgentRules } from "../runtime/agentRules.js";

export async function create(name: string): Promise<void> {
  const targetDir = path.resolve(process.cwd(), name);

  console.log();
  console.log(pc.bold(pc.cyan("  barodoc create")));
  console.log();

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

  // Create logo
  await fs.writeFile(
    path.join(targetDir, "public/logo.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <defs>
    <linearGradient id="main" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0070f3"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <linearGradient id="fold" x1="62" y1="0" x2="90" y2="28" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#93c5fd"/>
    </linearGradient>
    <linearGradient id="back" x1="0" y1="14" x2="66" y2="96" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0070f3" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <rect x="2" y="16" width="60" height="82" rx="8" fill="url(#back)"/>
  <path d="M20 4 C20 1.8 21.8 0 24 0 L62 0 L90 28 L90 92 C90 94.2 88.2 96 86 96 L24 96 C21.8 96 20 94.2 20 92 Z" fill="url(#main)"/>
  <path d="M62 0 L62 20 C62 24.4 65.6 28 70 28 L90 28 Z" fill="url(#fold)"/>
  <rect x="34" y="42" width="30" height="5.5" rx="2.75" fill="white" opacity="0.95"/>
  <rect x="34" y="56" width="42" height="3.5" rx="1.75" fill="white" opacity="0.4"/>
  <rect x="34" y="66" width="36" height="3.5" rx="1.75" fill="white" opacity="0.4"/>
  <rect x="34" y="76" width="40" height="3.5" rx="1.75" fill="white" opacity="0.4"/>
</svg>
`
  );

  // Create CLAUDE.md for AI agent rules
  await fs.writeFile(
    path.join(targetDir, "CLAUDE.md"),
    generateAgentRules(name)
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
  console.log(`  ${pc.cyan("barodoc serve")}`);
  console.log();
}
