import type { AstroIntegration } from "astro";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config/loader.js";
import {
  loadPlugins,
  runHook,
  runConfigHook,
  getPluginIntegrations,
} from "./plugins/loader.js";
import type { BarodocOptions, ResolvedBarodocConfig } from "./types.js";
import type { PluginContext, ResolvedPlugin } from "./plugins/types.js";
import { getUIStringsForLocale, getDirForLocale } from "./i18n/utils.js";

const VIRTUAL_CONFIG_ID = "virtual:barodoc/config";
const VIRTUAL_I18N_ID = "virtual:barodoc/i18n";

function resolveVirtualId(id: string): string {
  return `\0${id}`;
}

interface VitePlugin {
  name: string;
  resolveId(id: string): string | undefined;
  load(id: string): string | undefined;
}

function createVirtualModulesPlugin(
  config: ResolvedBarodocConfig
): VitePlugin {
  return {
    name: "barodoc:virtual-modules",
    resolveId(id: string) {
      if (id === VIRTUAL_CONFIG_ID || id === VIRTUAL_I18N_ID) {
        return resolveVirtualId(id);
      }
      return undefined;
    },
    load(id: string) {
      if (id === resolveVirtualId(VIRTUAL_CONFIG_ID)) {
        return `export default ${JSON.stringify(config)};`;
      }
      if (id === resolveVirtualId(VIRTUAL_I18N_ID)) {
        const locales = config.i18n?.locales ?? ["en"];
        const defaultLocale = config.i18n?.defaultLocale ?? "en";
        const uiStrings: Record<string, Record<string, string>> = {};
        const dirByLocale: Record<string, "ltr" | "rtl"> = {};
        for (const locale of locales) {
          uiStrings[locale] = getUIStringsForLocale(locale, config.i18n);
          dirByLocale[locale] = getDirForLocale(locale, config.i18n);
        }
        return `
          export const i18n = ${JSON.stringify(config.i18n)};
          export const defaultLocale = ${JSON.stringify(defaultLocale)};
          export const locales = ${JSON.stringify(locales)};
          export const uiStrings = ${JSON.stringify(uiStrings)};
          export const dirByLocale = ${JSON.stringify(dirByLocale)};
        `;
      }
      return undefined;
    },
  };
}

export default function barodoc(options: BarodocOptions): AstroIntegration {
  const configPath = options.config || "barodoc.config.json";
  let resolvedConfig: ResolvedBarodocConfig;
  let resolvedPlugins: ResolvedPlugin[] = [];
  let pluginCtx: PluginContext;

  return {
    name: "@barodoc/core",
    hooks: {
      "astro:config:setup": async ({
        config,
        updateConfig,
        logger,
        command,
      }) => {
        logger.info("Loading Barodoc configuration...");

        // Convert URL to string path
        const rootPath = config.root instanceof URL
          ? config.root.pathname
          : String(config.root);

        // Load config
        resolvedConfig = await loadConfig(configPath, rootPath);
        logger.info(`Loaded config: ${resolvedConfig.name}`);

        const mode = command === "dev" ? "development" : "production";
        pluginCtx = {
          config: resolvedConfig,
          root: rootPath,
          mode,
        };

        const pluginConfigs = resolvedConfig.plugins ?? [];
        resolvedPlugins = await loadPlugins(pluginConfigs, pluginCtx);
        resolvedConfig = await runConfigHook(
          resolvedPlugins,
          resolvedConfig,
          pluginCtx
        );
        pluginCtx.config = resolvedConfig;

        if (resolvedPlugins.length > 0) {
          logger.info(`Loaded ${resolvedPlugins.length} plugin(s)`);
        }

        // Setup i18n
        const i18nConfig = resolvedConfig.i18n || {
          defaultLocale: "en",
          locales: ["en"],
        };

        const themeIntegration = options.theme.integration(resolvedConfig);
        const pluginIntegrations = getPluginIntegrations(resolvedPlugins, pluginCtx);

        // Detect overrides directory for component/layout customization
        const overridesDir = join(rootPath, "overrides");
        const overridesAlias: Record<string, string> = {};

        if (existsSync(join(overridesDir, "components"))) {
          overridesAlias["@overrides/components"] = join(overridesDir, "components");
          logger.info("Overrides: components/ detected");
        }
        if (existsSync(join(overridesDir, "layouts"))) {
          overridesAlias["@overrides/layouts"] = join(overridesDir, "layouts");
          logger.info("Overrides: layouts/ detected");
        }

        updateConfig({
          vite: {
            plugins: [createVirtualModulesPlugin(resolvedConfig) as any],
            resolve: Object.keys(overridesAlias).length > 0
              ? { alias: overridesAlias }
              : undefined,
          },
          integrations: [themeIntegration, ...pluginIntegrations],
        });

        logger.info(
          `i18n configured: ${i18nConfig.locales.length} locale(s)`
        );
      },

      "astro:config:done": ({ logger }) => {
        logger.info("Barodoc setup complete");
      },

      "astro:build:start": async ({ logger }) => {
        if (resolvedPlugins.length > 0) {
          await runHook(resolvedPlugins, "build:start", pluginCtx);
          logger.info("Plugin build:start hooks executed");
        }
      },

      "astro:build:done": async ({ dir, pages, logger }) => {
        if (resolvedPlugins.length > 0) {
          const outDir = dir instanceof URL ? fileURLToPath(dir) : String(dir);
          const buildContext = {
            outDir,
            pages: pages.map((p) => p.pathname),
          };
          await runHook(resolvedPlugins, "build:done", buildContext, pluginCtx);
          logger.info("Plugin build:done hooks executed");
        }
      },
    },
  };
}
