/**
 * Serves /@fs/ requests in dev so workspace theme-docs is loadable.
 * Astro's dev server handles all requests and never calls next(), so /@fs/ never
 * reaches Vite. This plugin adds a middleware first (via setTimeout) that
 * handles /@fs/ using the client environment's transformRequest.
 *
 * @param {string[]} fsAllow - Allowed absolute dirs (same as server.fs.allow)
 */
export function serveAtFsPlugin(fsAllow) {
  const allowedDirs = fsAllow.map((p) => p.replace(/\/$/, "") + "/");

  function isPathAllowed(absolutePath) {
    const normalized = (absolutePath.replace(/\/$/, "") + "/").replace(/\\/g, "/");
    return allowedDirs.some((dir) => normalized === dir || normalized.startsWith(dir));
  }

  return {
    name: "docs:serve-at-fs",
    enforce: "post",
    configureServer(viteServer) {
      const handler = async (req, res, next) => {
        const url = req.url;
        if (!url || !url.startsWith("/@fs/") || (req.method !== "GET" && req.method !== "HEAD")) {
          return next();
        }
        try {
          const pathMatch = url.match(/^\/@fs\/(\/?[^?]*)/);
          if (!pathMatch) return next();

          let fsPath;
          try {
            const raw = decodeURIComponent(pathMatch[1]);
            fsPath = raw.startsWith("/") ? raw : "/" + raw;
          } catch {
            res.writeHead(400);
            res.end();
            return;
          }

          if (!isPathAllowed(fsPath)) {
            res.writeHead(403);
            res.end();
            return;
          }

          const host = req.headers.host || "localhost:4321";
          const fullUrl = `http://${host}${url}`;
          const env = viteServer.environments?.client;
          let result = null;
          const fileUrl = "file://" + fsPath;

          if (env?.transformRequest) {
            for (const u of [fullUrl, url, fileUrl]) {
              try {
                result = await env.transformRequest(u);
                if (result?.code) break;
              } catch (_) {}
            }
          }
          if (!result?.code && viteServer.transformRequest) {
            for (const u of [fullUrl, url]) {
              try {
                result = await viteServer.transformRequest(u);
                if (result?.code) break;
              } catch (_) {}
            }
          }

          if (!result?.code) {
            return next();
          }

          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.writeHead(200);
          res.end(result.code);
        } catch (err) {
          return next();
        }
      };

      return () => {
        viteServer.middlewares.stack.unshift({ route: "", handle: handler });
      };
    },
  };
}
