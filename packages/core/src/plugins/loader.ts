import type {
  BarodocPlugin,
  PluginConfig,
  ResolvedPlugin,
  PluginContext,
  BarodocPluginHooks,
} from "./types.js";
import type { ResolvedBarodocConfig } from "../types.js";

/**
 * Load plugins from config
 */
export async function loadPlugins(
  pluginConfigs: PluginConfig[],
  context: PluginContext
): Promise<ResolvedPlugin[]> {
  const resolved: ResolvedPlugin[] = [];

  for (const config of pluginConfigs) {
    const [name, options] = Array.isArray(config)
      ? config
      : [config, undefined];

    try {
      // Dynamic import of the plugin package
      const pluginModule = await import(name);
      const pluginFactory = pluginModule.default || pluginModule;

      if (typeof pluginFactory !== "function") {
        throw new Error(`Plugin ${name} does not export a factory function`);
      }

      const plugin: BarodocPlugin = options
        ? pluginFactory(options)
        : pluginFactory();

      resolved.push({
        name,
        plugin,
        options,
      });
    } catch (error) {
      console.warn(`Failed to load plugin ${name}:`, error);
    }
  }

  return resolved;
}

/**
 * Run a specific hook for all plugins
 */
export async function runHook<K extends keyof BarodocPluginHooks>(
  plugins: ResolvedPlugin[],
  hookName: K,
  ...args: Parameters<NonNullable<BarodocPluginHooks[K]>>
): Promise<void> {
  for (const { plugin, name } of plugins) {
    const hook = plugin.hooks?.[hookName];
    if (hook) {
      try {
        // @ts-expect-error - Dynamic hook invocation
        await hook(...args);
      } catch (error) {
        console.error(`Error in plugin ${name} hook ${hookName}:`, error);
      }
    }
  }
}

/**
 * Run config:loaded hook and return modified config
 */
export async function runConfigHook(
  plugins: ResolvedPlugin[],
  config: ResolvedBarodocConfig,
  context: PluginContext
): Promise<ResolvedBarodocConfig> {
  let result = config;

  for (const { plugin, name } of plugins) {
    const hook = plugin.hooks?.["config:loaded"];
    if (hook) {
      try {
        result = await hook(result, context);
      } catch (error) {
        console.error(`Error in plugin ${name} config:loaded hook:`, error);
      }
    }
  }

  return result;
}

/**
 * Get Astro integrations from plugins
 */
export function getPluginIntegrations(
  plugins: ResolvedPlugin[],
  context: PluginContext
) {
  return plugins
    .filter((p) => p.plugin.astroIntegration)
    .map((p) => p.plugin.astroIntegration!(context));
}
