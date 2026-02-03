import type { AstroIntegration } from "astro";
import { definePlugin } from "@barodoc/core";

export type AnalyticsProvider = "google" | "plausible" | "umami";

export interface GoogleAnalyticsOptions {
  provider: "google";
  id: string;
}

export interface PlausibleAnalyticsOptions {
  provider: "plausible";
  domain: string;
  src?: string;
}

export interface UmamiAnalyticsOptions {
  provider: "umami";
  websiteId: string;
  src: string;
}

export type AnalyticsPluginOptions =
  | GoogleAnalyticsOptions
  | PlausibleAnalyticsOptions
  | UmamiAnalyticsOptions;

function generateScript(options: AnalyticsPluginOptions): string {
  switch (options.provider) {
    case "google":
      return `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${options.id}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${options.id}');
        </script>
      `;

    case "plausible":
      return `
        <script defer data-domain="${options.domain}" src="${options.src || "https://plausible.io/js/script.js"}"></script>
      `;

    case "umami":
      return `
        <script defer src="${options.src}" data-website-id="${options.websiteId}"></script>
      `;

    default:
      return "";
  }
}

export default definePlugin<AnalyticsPluginOptions>(
  (options: AnalyticsPluginOptions) => {
    return {
      name: "@barodoc/plugin-analytics",

      astroIntegration: () => {
        const integration: AstroIntegration = {
          name: "@barodoc/plugin-analytics",
          hooks: {
            "astro:config:setup": ({ injectScript }) => {
              // Inject analytics script into head
              const script = generateScript(options);
              if (script) {
                injectScript("head-inline", script);
              }
            },
          },
        };

        return integration;
      },
    };
  }
);
