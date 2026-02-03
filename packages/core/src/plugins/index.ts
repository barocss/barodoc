export type {
  BarodocPlugin,
  BarodocPluginFactory,
  BarodocPluginHooks,
  PluginConfig,
  PluginContext,
  ResolvedPlugin,
  ContentContext,
  BuildContext,
} from "./types.js";

export {
  loadPlugins,
  runHook,
  runConfigHook,
  getPluginIntegrations,
} from "./loader.js";

/**
 * Helper to define a plugin with type safety
 */
export function definePlugin<T = void>(
  factory: T extends void
    ? () => import("./types.js").BarodocPlugin
    : (options: T) => import("./types.js").BarodocPlugin
) {
  return factory;
}
