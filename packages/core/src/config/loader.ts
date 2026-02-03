import fs from "node:fs";
import path from "node:path";
import { barodocConfigSchema } from "./schema.js";
import type { BarodocConfig, ResolvedBarodocConfig } from "../types.js";

export async function loadConfig(
  configPath: string,
  root: string
): Promise<ResolvedBarodocConfig> {
  const absolutePath = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(root, configPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Barodoc config not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, "utf-8");
  const rawConfig = JSON.parse(content);

  const result = barodocConfigSchema.safeParse(rawConfig);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`Invalid barodoc.config.json:\n${errors}`);
  }

  const config = result.data as BarodocConfig;

  // Set defaults
  if (!config.i18n) {
    config.i18n = {
      defaultLocale: "en",
      locales: ["en"],
    };
  }

  if (!config.search) {
    config.search = { enabled: true };
  }

  return {
    ...config,
    _resolved: true,
    _configPath: absolutePath,
  };
}

export function getConfigDefaults(): Partial<BarodocConfig> {
  return {
    i18n: {
      defaultLocale: "en",
      locales: ["en"],
    },
    search: {
      enabled: true,
    },
    theme: {
      colors: {
        primary: "#0070f3",
      },
    },
  };
}
