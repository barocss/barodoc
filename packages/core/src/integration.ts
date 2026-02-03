import type { AstroIntegration } from "astro";
import { loadConfig } from "./config/loader.js";
import type { BarodocOptions, ResolvedBarodocConfig } from "./types.js";

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
      }) => {
        logger.info("Loading Barodoc configuration...");

        // Convert URL to string path
        const rootPath = config.root instanceof URL 
          ? config.root.pathname 
          : String(config.root);

        // Load config
        resolvedConfig = await loadConfig(configPath, rootPath);
        logger.info(`Loaded config: ${resolvedConfig.name}`);

        // Setup i18n
        const i18nConfig = resolvedConfig.i18n || {
          defaultLocale: "en",
          locales: ["en"],
        };

        // Merge theme integration
        const themeIntegration = options.theme.integration();

        // Merge theme integration
        // Note: i18n should be configured in astro.config.mjs, not here
        // to avoid Astro 5.x merge issues

        updateConfig({
          vite: {
            plugins: [createVirtualModulesPlugin(resolvedConfig) as any],
          },
          integrations: [themeIntegration],
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
