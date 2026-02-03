import sitemap from "@astrojs/sitemap";
import { definePlugin } from "@barodoc/core";

export interface SitemapPluginOptions {
  /**
   * Pages to exclude from sitemap
   */
  exclude?: string[];

  /**
   * Custom sitemap entries
   */
  customPages?: string[];
}

export default definePlugin<SitemapPluginOptions>((options = {}) => {
  return {
    name: "@barodoc/plugin-sitemap",

    astroIntegration: (context) => {
      return sitemap({
        filter: (page) => {
          if (options.exclude) {
            return !options.exclude.some((pattern) => page.includes(pattern));
          }
          return true;
        },
        customPages: options.customPages,
      });
    },
  };
});
