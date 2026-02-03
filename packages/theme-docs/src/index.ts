import type { AstroIntegration } from "astro";
import type { ThemeExport } from "@barodoc/core";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export interface DocsThemeOptions {
  customCss?: string[];
}

function createThemeIntegration(options?: DocsThemeOptions): AstroIntegration {
  return {
    name: "@barodoc/theme-docs",
    hooks: {
      "astro:config:setup": async ({ updateConfig, injectRoute, logger }) => {
        logger.info("Setting up Barodoc docs theme...");

        // Inject routes
        injectRoute({
          pattern: "/",
          entrypoint: "@barodoc/theme-docs/pages/index.astro",
        });

        injectRoute({
          pattern: "/docs/[...slug]",
          entrypoint: "@barodoc/theme-docs/pages/docs/[...slug].astro",
        });

        // Update Astro config with integrations and Vite plugins
        updateConfig({
          integrations: [mdx(), react()],
          vite: {
            plugins: [tailwindcss()],
            resolve: {
              dedupe: ["react", "react-dom"],
            },
          },
          markdown: {
            shikiConfig: {
              themes: {
                light: "github-light",
                dark: "github-dark",
              },
            },
          },
        });

        logger.info("Docs theme routes injected");
      },
    },
  };
}

export default function docsTheme(options?: DocsThemeOptions): ThemeExport {
  return {
    name: "@barodoc/theme-docs",
    integration: () => createThemeIntegration(options),
    styles: options?.customCss || [],
  };
}

// Re-export components for easy access
export * from "./components/index.ts";
