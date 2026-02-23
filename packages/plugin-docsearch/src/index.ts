import type { AstroIntegration } from "astro";
import { definePlugin } from "@barodoc/core";

export interface DocSearchPluginOptions {
  appId: string;
  apiKey: string;
  indexName: string;
  container?: string;
  placeholder?: string;
}

export default definePlugin<DocSearchPluginOptions>((options) => {
  return {
    name: "@barodoc/plugin-docsearch",
    hooks: {
      "config:loaded": (config) => {
        return {
          ...config,
          search: { ...config.search, enabled: false },
        };
      },
    },
    astroIntegration: () => {
      const integration: AstroIntegration = {
        name: "@barodoc/plugin-docsearch",
        hooks: {
          "astro:config:setup": ({ injectScript }) => {
            const cssUrl = "https://cdn.jsdelivr.net/npm/@docsearch/css@3/dist/style.min.css";
            const jsUrl = "https://cdn.jsdelivr.net/npm/@docsearch/js@3";

            injectScript(
              "head-inline",
              `document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="${cssUrl}" />');`
            );

            injectScript(
              "page",
              `
import docsearch from "${jsUrl}";

function initDocSearch() {
  const container = document.querySelector('${options.container || "#docsearch"}');
  if (!container || container.hasChildNodes()) return;
  docsearch({
    appId: "${options.appId}",
    apiKey: "${options.apiKey}",
    indexName: "${options.indexName}",
    container: "${options.container || "#docsearch"}",
    placeholder: "${options.placeholder || "Search docs..."}",
  });
}

if (document.readyState === "complete") initDocSearch();
else document.addEventListener("DOMContentLoaded", initDocSearch);
document.addEventListener("astro:page-load", initDocSearch);
`
            );
          },
        },
      };
      return integration;
    },
  };
});
