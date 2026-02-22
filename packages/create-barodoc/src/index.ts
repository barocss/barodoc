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
  await fs.ensureDir(path.join(targetDir, ".github/workflows"));

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
    `---
title: Introduction
description: Welcome to your documentation site
---

# Introduction

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
    `---
title: Quick Start
description: Get started with your documentation site
---

# Quick Start

## Local Development

\`\`\`bash
npx barodoc serve
\`\`\`

## Production Build

\`\`\`bash
npx barodoc build
\`\`\`

## Deployment

This project includes a GitHub Actions workflow that automatically builds and deploys
your documentation to GitHub Pages on every push to \`main\`.

To enable GitHub Pages:
1. Go to your repository **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to \`main\` — your docs will be live!

> If your site is hosted at a subpath (e.g. \`https://username.github.io/repo-name\`),
> add \`"base": "/repo-name"\` to your \`barodoc.config.json\`.
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

  // Create GitHub Actions workflow for GitHub Pages deployment
  await fs.writeFile(
    path.join(targetDir, ".github/workflows/deploy.yml"),
    `name: Deploy Documentation

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Cache npm dependencies
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: \${{ runner.os }}-npm-barodoc
          restore-keys: |
            \${{ runner.os }}-npm-

      - name: Build documentation
        run: npx barodoc build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
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
  console.log(pc.dim("To deploy: push to GitHub and enable Pages in repo Settings → Pages"));
  console.log();
}

main().catch((err) => {
  console.error(pc.red("Error:"), err);
  process.exit(1);
});
