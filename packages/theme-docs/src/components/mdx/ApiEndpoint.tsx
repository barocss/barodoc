import * as React from "react";
import { cn } from "../../lib/utils.js";

interface ApiEndpointProps {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  summary?: string;
  id?: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bd-method-get",
  POST: "bd-method-post",
  PUT: "bd-method-put",
  PATCH: "bd-method-patch",
  DELETE: "bd-method-delete",
};

export function ApiEndpoint({ method, path, summary, id }: ApiEndpointProps) {
  const slug = id || `${method.toLowerCase()}-${path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`;

  return (
    <div className="bd-api-endpoint" id={slug}>
      <a href={`#${slug}`} className="bd-api-endpoint-anchor" aria-label={`${method} ${path}`}>
        <div className="bd-api-endpoint-header">
          <span className={cn("bd-api-endpoint-method", METHOD_COLORS[method])}>
            {method}
          </span>
          <code className="bd-api-endpoint-path">{path}</code>
        </div>
        {summary && <p className="bd-api-endpoint-summary">{summary}</p>}
      </a>
    </div>
  );
}
