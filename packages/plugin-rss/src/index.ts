import type { AstroIntegration } from "astro";
import { definePlugin } from "@barodoc/core";

export interface RssPluginOptions {
  title?: string;
  description?: string;
  collections?: ("blog" | "changelog")[];
}

export default definePlugin<RssPluginOptions>((options = {}) => {
  const {
    title,
    description = "Latest updates",
    collections = ["blog"],
  } = options;

  return {
    name: "@barodoc/plugin-rss",
    astroIntegration: (context) => {
      const feedTitle = title || context.config.name;

      const integration: AstroIntegration = {
        name: "@barodoc/plugin-rss",
        hooks: {
          "astro:config:setup": ({ injectRoute }) => {
            injectRoute({
              pattern: "/rss.xml",
              entrypoint: "@barodoc/plugin-rss/feed-endpoint",
            });
          },
        },
      };
      return integration;
    },
    hooks: {
      "config:loaded": (config) => {
        return {
          ...config,
          _rss: { title: title || config.name, description, collections },
        } as typeof config;
      },
    },
  };
});
