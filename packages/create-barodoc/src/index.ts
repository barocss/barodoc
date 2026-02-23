#!/usr/bin/env node

import { execSync } from "child_process";

const name = process.argv[2];

if (!name) {
  console.error("Usage: pnpm create barodoc <project-name>");
  process.exit(1);
}

execSync(`npx barodoc create ${name}`, { stdio: "inherit" });
