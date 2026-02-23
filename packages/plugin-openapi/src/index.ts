import type { AstroIntegration } from "astro";
import { definePlugin } from "@barodoc/core";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

export interface OpenApiPluginOptions {
  specFile: string;
  basePath?: string;
  groupBy?: "tags" | "paths";
  baseUrl?: string;
  playground?: boolean;
}

interface OpenApiSpec {
  openapi?: string;
  info?: { title?: string; version?: string; description?: string };
  paths?: Record<string, Record<string, OpenApiOperation>>;
  components?: { schemas?: Record<string, unknown> };
}

interface OpenApiOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    content?: Record<string, { schema?: OpenApiSchema }>;
  };
  responses?: Record<string, {
    description?: string;
    content?: Record<string, { schema?: OpenApiSchema }>;
  }>;
}

interface OpenApiParameter {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  description?: string;
  required?: boolean;
  schema?: OpenApiSchema;
}

interface OpenApiSchema {
  type?: string;
  format?: string;
  items?: OpenApiSchema;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  description?: string;
  enum?: string[];
  $ref?: string;
}

function resolveRef(ref: string, spec: OpenApiSpec): OpenApiSchema {
  const parts = ref.replace("#/", "").split("/");
  let current: unknown = spec;
  for (const part of parts) {
    current = (current as Record<string, unknown>)?.[part];
  }
  return (current as OpenApiSchema) || {};
}

function schemaToType(schema: OpenApiSchema | undefined, spec: OpenApiSpec): string {
  if (!schema) return "any";
  if (schema.$ref) return schemaToType(resolveRef(schema.$ref, spec), spec);
  if (schema.enum) return schema.enum.map((e) => `"${e}"`).join(" \\| ");
  if (schema.type === "array") return `${schemaToType(schema.items, spec)}[]`;
  if (schema.type === "object" && schema.properties) return "object";
  return schema.type || "any";
}

function generateExampleFromSchema(schema: OpenApiSchema | undefined, spec: OpenApiSpec, depth = 0): unknown {
  if (!schema || depth > 5) return null;
  if (schema.$ref) return generateExampleFromSchema(resolveRef(schema.$ref, spec), spec, depth + 1);
  if (schema.enum) return schema.enum[0];
  switch (schema.type) {
    case "string":
      if (schema.format === "date-time") return "2024-01-15T09:30:00.000Z";
      if (schema.format === "date") return "2024-01-15";
      if (schema.format === "email") return "user@example.com";
      return "string";
    case "integer":
    case "number":
      return schema.format === "int64" ? 10 : 0;
    case "boolean":
      return true;
    case "array":
      return [generateExampleFromSchema(schema.items, spec, depth + 1)];
    case "object": {
      if (!schema.properties) return {};
      const obj: Record<string, unknown> = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        obj[key] = generateExampleFromSchema(prop, spec, depth + 1);
      }
      return obj;
    }
    default:
      return null;
  }
}

function escapeMdx(text: string): string {
  return text.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
}

interface GenerateOptions {
  playground: boolean;
  baseUrl: string;
}

function buildPlaygroundParams(op: OpenApiOperation, spec: OpenApiSpec): string {
  const params = op.parameters || [];
  if (params.length === 0) return "[]";

  const items = params.map((p) => {
    const type = schemaToType(p.schema, spec).replace(/"/g, "'").replace(/\\\|/g, "|");
    const desc = (p.description || "").replace(/"/g, '\\"');
    const resolved = p.schema?.$ref ? resolveRef(p.schema.$ref, spec) : p.schema;
    const enumVals = resolved?.enum;
    const enumProp = enumVals ? `, enum: ${JSON.stringify(enumVals)}` : "";
    return `{ name: "${p.name}", in: "${p.in}", type: "${type}", required: ${!!p.required}, description: "${desc}"${enumProp} }`;
  });
  return `[${items.join(", ")}]`;
}

function buildInitialBody(op: OpenApiOperation, spec: OpenApiSpec): string | null {
  const content = op.requestBody?.content;
  if (!content) return null;

  for (const [, mediaObj] of Object.entries(content)) {
    if (!mediaObj.schema) continue;
    const resolved = mediaObj.schema.$ref
      ? resolveRef(mediaObj.schema.$ref, spec)
      : mediaObj.schema;
    const example = generateExampleFromSchema(resolved, spec);
    if (example && typeof example === "object") {
      return JSON.stringify(example, null, 2);
    }
  }
  return null;
}

function buildCurlExample(method: string, fullUrl: string, op: OpenApiOperation, spec: OpenApiSpec): string {
  const parts = [`curl -X ${method} '${fullUrl}'`];
  if (op.requestBody?.content?.["application/json"]) {
    parts.push(`  -H 'Content-Type: application/json'`);
    const schema = op.requestBody.content["application/json"].schema;
    if (schema) {
      const resolved = schema.$ref ? resolveRef(schema.$ref, spec) : schema;
      const example = generateExampleFromSchema(resolved, spec);
      if (example) {
        parts.push(`  -d '${JSON.stringify(example)}'`);
      }
    }
  }
  return parts.join(" \\\n");
}

function statusCodeClass(code: string): string {
  const n = parseInt(code, 10);
  if (n < 300) return "bd-status-2xx";
  if (n < 400) return "bd-status-3xx";
  if (n < 500) return "bd-status-4xx";
  return "bd-status-5xx";
}

function generateMdxForOperation(
  httpMethod: string,
  urlPath: string,
  op: OpenApiOperation,
  spec: OpenApiSpec,
  opts: GenerateOptions,
): string {
  const lines: string[] = [];
  const method = httpMethod.toUpperCase();
  const summary = op.summary || "";
  const description = op.description || "";

  lines.push(`<ApiEndpoint method="${method}" path={\`${urlPath}\`} summary="${summary.replace(/"/g, '\\"')}"  />\n`);

  if (description && description !== summary) {
    lines.push(`${description}\n`);
  }

  const params = op.parameters || [];
  if (params.length > 0) {
    lines.push(`<div className="bd-api-section">\n`);
    lines.push(`#### Parameters\n`);
    lines.push(`<div className="bd-api-param-list">\n`);
    for (const p of params) {
      const type = schemaToType(p.schema, spec);
      const required = p.required ? ' <span className="bd-param-required">required</span>' : ' <span className="bd-param-optional">optional</span>';
      lines.push(`<div className="bd-api-param-item">`);
      lines.push(`  <div className="bd-api-param-name">`);
      lines.push(`    <code>${p.name}</code>${required}`);
      lines.push(`    <span className="bd-api-param-type">${escapeMdx(type)}</span>`);
      lines.push(`  </div>`);
      if (p.description) {
        lines.push(`  <div className="bd-api-param-desc">${p.description}</div>`);
      }
      if (p.schema?.enum) {
        const vals = p.schema.enum.map((e) => `\`${e}\``).join(" ");
        lines.push(`  <div className="bd-api-param-enum">Values: ${vals}</div>`);
      }
      lines.push(`</div>\n`);
    }
    lines.push(`</div>\n`);
    lines.push(`</div>\n`);
  }

  if (op.requestBody) {
    lines.push(`<div className="bd-api-section">\n`);
    lines.push(`#### Request Body\n`);
    const content = op.requestBody.content;
    if (content) {
      for (const [mediaType, mediaObj] of Object.entries(content)) {
        lines.push(`<span className="bd-api-content-type">\`${mediaType}\`</span>\n`);
        if (mediaObj.schema) {
          const resolved = mediaObj.schema.$ref
            ? resolveRef(mediaObj.schema.$ref, spec)
            : mediaObj.schema;
          if (resolved.properties) {
            lines.push(`<div className="bd-api-param-list">\n`);
            for (const [name, prop] of Object.entries(resolved.properties)) {
              const req = resolved.required?.includes(name);
              const reqBadge = req ? ' <span className="bd-param-required">required</span>' : ' <span className="bd-param-optional">optional</span>';
              const type = schemaToType(prop, spec);
              lines.push(`<div className="bd-api-param-item">`);
              lines.push(`  <div className="bd-api-param-name">`);
              lines.push(`    <code>${name}</code>${reqBadge}`);
              lines.push(`    <span className="bd-api-param-type">${escapeMdx(type)}</span>`);
              lines.push(`  </div>`);
              if (prop.description) {
                lines.push(`  <div className="bd-api-param-desc">${prop.description}</div>`);
              }
              if (prop.enum) {
                const vals = prop.enum.map((e) => `\`${e}\``).join(" ");
                lines.push(`  <div className="bd-api-param-enum">Values: ${vals}</div>`);
              }
              lines.push(`</div>\n`);
            }
            lines.push(`</div>\n`);
          }
        }
      }
    }
    lines.push(`</div>\n`);
  }

  if (op.responses) {
    lines.push(`<div className="bd-api-section">\n`);
    lines.push(`#### Responses\n`);
    lines.push(`<div className="bd-api-responses">\n`);
    for (const [status, resp] of Object.entries(op.responses)) {
      const cls = statusCodeClass(status);
      lines.push(`<div className="bd-api-response-item">`);
      lines.push(`  <span className="bd-api-status-badge ${cls}">${status}</span>`);
      lines.push(`  <span className="bd-api-response-desc">${resp.description || ""}</span>`);
      lines.push(`</div>\n`);

      const respContent = resp.content?.["application/json"]?.schema;
      if (respContent) {
        const resolved = respContent.$ref ? resolveRef(respContent.$ref, spec) : respContent;
        const example = generateExampleFromSchema(resolved, spec);
        if (example) {
          const jsonStr = JSON.stringify(example, null, 2);
          lines.push(`<details className="bd-api-example-details">`);
          lines.push(`<summary>Example Response</summary>\n`);
          lines.push("```json");
          lines.push(jsonStr);
          lines.push("```\n");
          lines.push(`</details>\n`);
        }
      }
    }
    lines.push(`</div>\n`);
    lines.push(`</div>\n`);
  }

  const fullUrl = `${opts.baseUrl}${urlPath}`;
  const curlExample = buildCurlExample(method, fullUrl, op, spec);
  lines.push(`<details className="bd-api-example-details">`);
  lines.push(`<summary>Request Example</summary>\n`);
  lines.push("```bash");
  lines.push(curlExample);
  lines.push("```\n");
  lines.push(`</details>\n`);

  if (opts.playground) {
    const paramsStr = buildPlaygroundParams(op, spec);
    const bodyStr = buildInitialBody(op, spec);
    const bodyProp = bodyStr ? ` body={${JSON.stringify(bodyStr)}}` : "";
    lines.push(`<ApiPlayground client:load method="${method}" url="${fullUrl}" params={${paramsStr}}${bodyProp} />\n`);
  }

  lines.push(`<hr className="bd-api-divider" />\n`);
  return lines.join("\n");
}

export default definePlugin<OpenApiPluginOptions>((options) => {
  const {
    specFile,
    basePath = "/api",
    groupBy = "tags",
    baseUrl = "",
    playground = true,
  } = options;

  return {
    name: "@barodoc/plugin-openapi",
    astroIntegration: (context) => {
      const integration: AstroIntegration = {
        name: "@barodoc/plugin-openapi",
        hooks: {
          "astro:config:setup": ({ injectRoute, config: astroConfig }) => {
            const root = astroConfig.root.pathname;
            const specPath = path.resolve(root, specFile);

            if (!fs.existsSync(specPath)) {
              console.warn(`[plugin-openapi] Spec file not found: ${specPath}`);
              return;
            }

            const raw = fs.readFileSync(specPath, "utf-8");
            const spec: OpenApiSpec = specPath.endsWith(".yaml") || specPath.endsWith(".yml")
              ? parseYaml(raw)
              : JSON.parse(raw);

            if (!spec.paths) return;

            const genOpts: GenerateOptions = { playground, baseUrl };
            const imports: string[] = [];
            imports.push(`import { ApiEndpoint } from "@barodoc/theme-docs/components";`);
            if (playground) {
              imports.push(`import { ApiPlayground } from "@barodoc/theme-docs/components";`);
            }
            const importBlock = imports.join("\n") + "\n";

            const pagesDir = path.join(root, "src/content/docs");
            const apiDir = path.join(pagesDir, basePath.replace(/^\//, ""));
            fs.mkdirSync(apiDir, { recursive: true });

            const apiOverview = buildApiOverview(spec, baseUrl);

            if (groupBy === "tags") {
              const tagMap = new Map<string, { method: string; path: string; summary: string }[]>();
              const tagOps = new Map<string, string[]>();

              for (const [urlPath, methods] of Object.entries(spec.paths)) {
                for (const [method, op] of Object.entries(methods)) {
                  const tags = op.tags?.length ? op.tags : ["default"];
                  const mdx = generateMdxForOperation(method, urlPath, op, spec, genOpts);
                  for (const tag of tags) {
                    if (!tagMap.has(tag)) tagMap.set(tag, []);
                    if (!tagOps.has(tag)) tagOps.set(tag, []);
                    tagMap.get(tag)!.push({ method: method.toUpperCase(), path: urlPath, summary: op.summary || "" });
                    tagOps.get(tag)!.push(mdx);
                  }
                }
              }

              for (const [tag, endpoints] of tagMap) {
                const slug = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                const toc = buildEndpointToc(endpoints);
                const content = [
                  "---",
                  `title: "${tag}"`,
                  `description: "API endpoints for ${tag}"`,
                  "api_reference: true",
                  "---",
                  importBlock,
                  apiOverview,
                  toc,
                  ...tagOps.get(tag)!,
                ].join("\n");
                fs.writeFileSync(path.join(apiDir, `${slug}.mdx`), content);
              }
            } else {
              const allOps: string[] = [];
              const allEndpoints: { method: string; path: string; summary: string }[] = [];
              for (const [urlPath, methods] of Object.entries(spec.paths)) {
                for (const [method, op] of Object.entries(methods)) {
                  allOps.push(generateMdxForOperation(method, urlPath, op, spec, genOpts));
                  allEndpoints.push({ method: method.toUpperCase(), path: urlPath, summary: op.summary || "" });
                }
              }
              const toc = buildEndpointToc(allEndpoints);
              const content = [
                "---",
                `title: "API Reference"`,
                `description: "Auto-generated from OpenAPI spec"`,
                "api_reference: true",
                "---",
                importBlock,
                apiOverview,
                toc,
                ...allOps,
              ].join("\n");
              fs.writeFileSync(path.join(apiDir, "index.mdx"), content);
            }
          },
        },
      };
      return integration;
    },
  };
});

function buildApiOverview(spec: OpenApiSpec, baseUrl: string): string {
  const lines: string[] = [];
  lines.push(`<div className="bd-api-overview">`);
  if (baseUrl) {
    lines.push(`  <div className="bd-api-overview-item">`);
    lines.push(`    <span className="bd-api-overview-label">Base URL</span>`);
    lines.push(`    <code className="bd-api-overview-value">${baseUrl}</code>`);
    lines.push(`  </div>`);
  }
  lines.push(`  <div className="bd-api-overview-item">`);
  lines.push(`    <span className="bd-api-overview-label">Content-Type</span>`);
  lines.push(`    <code className="bd-api-overview-value">application/json</code>`);
  lines.push(`  </div>`);
  if (spec.info?.version) {
    lines.push(`  <div className="bd-api-overview-item">`);
    lines.push(`    <span className="bd-api-overview-label">Version</span>`);
    lines.push(`    <code className="bd-api-overview-value">${spec.info.version}</code>`);
    lines.push(`  </div>`);
  }
  lines.push(`</div>\n`);
  return lines.join("\n");
}

function buildEndpointToc(endpoints: { method: string; path: string; summary: string }[]): string {
  const lines: string[] = [];
  lines.push(`<nav className="bd-api-toc">`);
  lines.push(`  <div className="bd-api-toc-title">Endpoints</div>`);
  lines.push(`  <div className="bd-api-toc-list">`);
  for (const ep of endpoints) {
    const slug = `${ep.method.toLowerCase()}-${ep.path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`;
    lines.push(`    <a className="bd-api-toc-item" href={"#${slug}"}>`);
    lines.push(`      <span className="bd-api-toc-method bd-method-${ep.method.toLowerCase()}">${ep.method}</span>`);
    const pathDisplay = ep.path.includes("{") ? `{\`${ep.path}\`}` : ep.path;
    lines.push(`      <span className="bd-api-toc-path">${pathDisplay}</span>`);
    if (ep.summary) {
      lines.push(`      <span className="bd-api-toc-summary">${ep.summary.replace(/"/g, '\\"')}</span>`);
    }
    lines.push(`    </a>`);
  }
  lines.push(`  </div>`);
  lines.push(`</nav>\n`);
  return lines.join("\n");
}
