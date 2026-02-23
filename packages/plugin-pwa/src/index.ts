import type { AstroIntegration } from "astro";
import { definePlugin } from "@barodoc/core";
import fs from "node:fs";
import path from "node:path";

export interface PwaPluginOptions {
  name?: string;
  shortName?: string;
  themeColor?: string;
  backgroundColor?: string;
  display?: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  offlineFallback?: string;
}

export default definePlugin<PwaPluginOptions>((options = {}) => {
  const {
    display = "standalone",
    themeColor = "#2563eb",
    backgroundColor = "#ffffff",
    offlineFallback = "/404",
  } = options;

  return {
    name: "@barodoc/plugin-pwa",
    astroIntegration: (context) => {
      const siteName = options.name || context.config.name;
      const shortName = options.shortName || siteName;

      const integration: AstroIntegration = {
        name: "@barodoc/plugin-pwa",
        hooks: {
          "astro:config:setup": ({ injectScript }) => {
            injectScript(
              "head-inline",
              `document.head.insertAdjacentHTML('beforeend', '<link rel="manifest" href="/manifest.json" />');`
            );

            injectScript(
              "page",
              `
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
`
            );
          },

          "astro:build:done": async ({ dir }) => {
            const outDir = dir.pathname;

            const manifest = {
              name: siteName,
              short_name: shortName,
              start_url: "/",
              display,
              theme_color: themeColor,
              background_color: backgroundColor,
              icons: [
                { src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
              ],
            };

            fs.writeFileSync(
              path.join(outDir, "manifest.json"),
              JSON.stringify(manifest, null, 2)
            );

            const sw = `
const CACHE_NAME = "barodoc-v1";
const OFFLINE_URL = "${offlineFallback}";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(OFFLINE_URL).then((r) => r || new Response("Offline", { status: 503 }))
    )
  );
});
`;

            fs.writeFileSync(path.join(outDir, "sw.js"), sw.trim());
          },
        },
      };
      return integration;
    },
  };
});
