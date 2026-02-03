export { default } from "./integration.js";
export * from "./types.js";
export { loadConfig, barodocConfigSchema } from "./config/index.js";
export {
  getLocaleFromPath,
  removeLocaleFromPath,
  getLocalizedPath,
  getLocalizedNavGroup,
  getLocaleLabel,
} from "./i18n/index.js";

// Plugin system
export {
  definePlugin,
  loadPlugins,
  runHook,
  runConfigHook,
  getPluginIntegrations,
} from "./plugins/index.js";
export type {
  BarodocPlugin,
  BarodocPluginFactory,
  BarodocPluginHooks,
  PluginConfig,
  PluginContext,
  ResolvedPlugin,
  ContentContext,
  BuildContext,
} from "./plugins/index.js";
