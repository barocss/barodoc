import type { AstroIntegration } from "astro";
import type { ResolvedBarodocConfig } from "../types.js";

/**
 * Plugin hook context
 */
export interface PluginContext {
  config: ResolvedBarodocConfig;
  root: string;
  mode: "development" | "production";
}

/**
 * Content transformation context
 */
export interface ContentContext {
  filePath: string;
  content: string;
  frontmatter: Record<string, unknown>;
}

/**
 * Build context
 */
export interface BuildContext {
  outDir: string;
  pages: string[];
}

/**
 * Plugin hooks
 */
export interface BarodocPluginHooks {
  /**
   * Called after config is loaded
   * Can modify the config
   */
  "config:loaded"?: (
    config: ResolvedBarodocConfig,
    context: PluginContext
  ) => ResolvedBarodocConfig | Promise<ResolvedBarodocConfig>;

  /**
   * Called for each content file
   * Can transform content
   */
  "content:transform"?: (
    context: ContentContext
  ) => ContentContext | Promise<ContentContext>;

  /**
   * Called before build starts
   */
  "build:start"?: (context: PluginContext) => void | Promise<void>;

  /**
   * Called after build completes
   */
  "build:done"?: (
    buildContext: BuildContext,
    context: PluginContext
  ) => void | Promise<void>;
}

/**
 * Barodoc plugin definition
 */
export interface BarodocPlugin {
  /**
   * Plugin name (should be unique)
   */
  name: string;

  /**
   * Plugin hooks
   */
  hooks?: BarodocPluginHooks;

  /**
   * Astro integration to add
   */
  astroIntegration?: (context: PluginContext) => AstroIntegration;
}

/**
 * Plugin factory function
 */
export type BarodocPluginFactory<T = void> = T extends void
  ? () => BarodocPlugin
  : (options: T) => BarodocPlugin;

/**
 * Plugin configuration in barodoc.config.json
 * Can be:
 * - string: plugin name (e.g., "@barodoc/plugin-sitemap")
 * - [string, object]: plugin with options (e.g., ["@barodoc/plugin-analytics", { id: "G-XXX" }])
 */
export type PluginConfig =
  | string
  | [string, Record<string, unknown>];

/**
 * Resolved plugin with options
 */
export interface ResolvedPlugin {
  name: string;
  plugin: BarodocPlugin;
  options?: Record<string, unknown>;
}
