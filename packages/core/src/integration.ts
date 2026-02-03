import type { AstroIntegration } from "astro";
import { loadConfig } from "./config/loader.js";
import {
  loadPlugins,
  runConfigHook,
  getPluginIntegrations,
} from "./plugins/loader.js";
import type { BarodocOptions, ResolvedBarodocConfig } from "./types.js";
import type { PluginContext } from "./plugins/types.js";

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
        return `
          export const i18n = ${JSON.stringify(config.i18n)};
          export const defaultLocale = "${config.i18n?.defaultLocale || "en"}";
          export const locales = ${JSON.stringify(config.i18n?.locales || ["en"])};
        `;
      }
      return undefined;
    },
  };
}

export default function barodoc(options: BarodocOptions): AstroIntegration {
  const configPath = options.config || "barodoc.config.json";
  let resolvedConfig: ResolvedBarodocConfig;

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
        const pluginContext: PluginContext = {
          config: resolvedConfig,
          root: rootPath,
          mode,
        };

        // Load and run plugins
        const pluginConfigs = resolvedConfig.plugins ?? [];
        const plugins = await loadPlugins(pluginConfigs, pluginContext);
        resolvedConfig = await runConfigHook(
          plugins,
          resolvedConfig,
          pluginContext
        );
        pluginContext.config = resolvedConfig;

        if (plugins.length > 0) {
          logger.info(`Loaded ${plugins.length} plugin(s)`);
        }

        // Setup i18n
        const i18nConfig = resolvedConfig.i18n || {
          defaultLocale: "en",
          locales: ["en"],
        };

        // Theme + plugin integrations
        const themeIntegration = options.theme.integration();
        const pluginIntegrations = getPluginIntegrations(plugins, pluginContext);

        updateConfig({
          vite: {
            plugins: [createVirtualModulesPlugin(resolvedConfig) as any],
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
    },
  };
}
