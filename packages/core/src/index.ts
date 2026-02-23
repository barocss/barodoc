export { default } from "./integration.js";
export * from "./types.js";
export { loadConfig, barodocConfigSchema, docsFrontmatterSchema } from "./config/index.js";
export type { DocsFrontmatter } from "./config/index.js";
export {
  getLocaleFromPath,
  removeLocaleFromPath,
  getLocalizedPath,
  getLocalizedNavGroup,
  getLocaleLabel,
} from "./i18n/index.js";

// Theme utilities
export { generateThemeCSS, generateAccentScale, getGrayScale } from "./theme/colors.js";
export { grayPresets } from "./config/schema.js";
export type { GrayPreset } from "./config/schema.js";

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
