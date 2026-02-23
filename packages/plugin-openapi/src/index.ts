import type { AstroIntegration } from "astro";
import { definePlugin } from "@barodoc/core";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

export interface OpenApiPluginOptions {
  specFile: string;
  basePath?: string;
  groupBy?: "tags" | "paths";
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
  if (schema.enum) return schema.enum.map((e) => `"${e}"`).join(" | ");
  if (schema.type === "array") return `${schemaToType(schema.items, spec)}[]`;
  if (schema.type === "object" && schema.properties) return "object";
  return schema.type || "any";
}

function generateMdxForOperation(
  httpMethod: string,
  urlPath: string,
  op: OpenApiOperation,
  spec: OpenApiSpec
): string {
  const lines: string[] = [];
  const method = httpMethod.toUpperCase();

  lines.push(`### ${method} ${urlPath}\n`);
  if (op.summary) lines.push(`${op.summary}\n`);
  if (op.description) lines.push(`${op.description}\n`);

  // Parameters
  const params = op.parameters || [];
  if (params.length > 0) {
    lines.push(`#### Parameters\n`);
    lines.push(`| Name | In | Type | Required | Description |`);
    lines.push(`| --- | --- | --- | --- | --- |`);
    for (const p of params) {
      const type = schemaToType(p.schema, spec);
      lines.push(`| \`${p.name}\` | ${p.in} | \`${type}\` | ${p.required ? "Yes" : "No"} | ${p.description || ""} |`);
    }
    lines.push("");
  }

  // Request body
  if (op.requestBody) {
    lines.push(`#### Request Body\n`);
    const content = op.requestBody.content;
    if (content) {
      for (const [mediaType, mediaObj] of Object.entries(content)) {
        lines.push(`**Content-Type**: \`${mediaType}\`\n`);
        if (mediaObj.schema) {
          const resolved = mediaObj.schema.$ref
            ? resolveRef(mediaObj.schema.$ref, spec)
            : mediaObj.schema;
          if (resolved.properties) {
            lines.push(`| Property | Type | Required | Description |`);
            lines.push(`| --- | --- | --- | --- |`);
            for (const [name, prop] of Object.entries(resolved.properties)) {
              const req = resolved.required?.includes(name) ? "Yes" : "No";
              lines.push(`| \`${name}\` | \`${schemaToType(prop, spec)}\` | ${req} | ${prop.description || ""} |`);
            }
            lines.push("");
          }
        }
      }
    }
  }

  // Responses
  if (op.responses) {
    lines.push(`#### Responses\n`);
    for (const [status, resp] of Object.entries(op.responses)) {
      lines.push(`**${status}**: ${resp.description || ""}\n`);
    }
  }

  lines.push("---\n");
  return lines.join("\n");
}

export default definePlugin<OpenApiPluginOptions>((options) => {
  const { specFile, basePath = "/api", groupBy = "tags" } = options;

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

            // Generate a single MDX page with all endpoints
            const pagesDir = path.join(root, "src/content/docs");
            const apiDir = path.join(pagesDir, basePath.replace(/^\//, ""));
            fs.mkdirSync(apiDir, { recursive: true });

            if (groupBy === "tags") {
              const tagMap = new Map<string, string[]>();

              for (const [urlPath, methods] of Object.entries(spec.paths)) {
                for (const [method, op] of Object.entries(methods)) {
                  const tags = op.tags?.length ? op.tags : ["default"];
                  const mdx = generateMdxForOperation(method, urlPath, op, spec);
                  for (const tag of tags) {
                    if (!tagMap.has(tag)) tagMap.set(tag, []);
                    tagMap.get(tag)!.push(mdx);
                  }
                }
              }

              for (const [tag, operations] of tagMap) {
                const slug = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                const content = [
                  "---",
                  `title: "${tag}"`,
                  `description: "API endpoints for ${tag}"`,
                  "api_reference: true",
                  "---",
                  "",
                  ...operations,
                ].join("\n");
                fs.writeFileSync(path.join(apiDir, `${slug}.mdx`), content);
              }
            } else {
              const allOps: string[] = [];
              for (const [urlPath, methods] of Object.entries(spec.paths)) {
                for (const [method, op] of Object.entries(methods)) {
                  allOps.push(generateMdxForOperation(method, urlPath, op, spec));
                }
              }
              const content = [
                "---",
                `title: "API Reference"`,
                `description: "Auto-generated from OpenAPI spec"`,
                "api_reference: true",
                "---",
                "",
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
