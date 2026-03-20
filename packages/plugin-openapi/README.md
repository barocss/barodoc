# @barodoc/plugin-openapi

Generate API documentation pages from OpenAPI (Swagger) 3.x specs. Each endpoint gets parameter tables, response examples, cURL snippets, and an optional interactive playground.

## Install

```bash
pnpm add @barodoc/plugin-openapi
```

## Config

Add to `barodoc.config.json`:

```json
{
  "plugins": [
    ["@barodoc/plugin-openapi", {
      "specFile": "openapi.yaml",
      "basePath": "api",
      "groupBy": "tags",
      "baseUrl": "https://api.example.com",
      "playground": true
    }]
  ]
}
```

- **specFile** — Path to spec (YAML/JSON), or an array of `{ file, basePath?, baseUrl?, groupBy? }` for multiple APIs.
- **basePath** — Output directory under docs (e.g. `api` → `/docs/api/...`).
- **groupBy** — `"tags"` (one page per tag) or `"paths"` (all on one page).
- **baseUrl** — Base URL for playground and cURL examples.
- **playground** — Set to `false` for docs-only (no try-it UI).

Add the generated slugs to `navigation` (e.g. `["api/users", "api/auth"]`).

## Docs

Full guide: [OpenAPI Plugin](https://barodoc.dev/guides/plugins/openapi) — multi-spec setup, options reference, and playground auth.

## Limitations

- No built-in **version dropdown** for multiple API versions (e.g. v1 vs v2); use separate specs and nav groups or doc versioning.
- **Playground** is optional; when enabled it runs in the browser (CORS and auth are your responsibility).

## Roadmap

- Optional version switcher for multiple spec versions.
- More auth schemes in the playground (OAuth2).
- Export OpenAPI spec from playground requests for debugging.
