import * as React from "react";
import { cn } from "../../lib/utils.js";

interface ParamDef {
  name: string;
  in: "query" | "path" | "header" | "body";
  type?: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
}

interface ApiPlaygroundProps {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  params?: ParamDef[];
  body?: string;
  headers?: Record<string, string>;
  className?: string;
}

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  POST: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  PUT: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PATCH: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function ApiPlayground({
  method = "GET",
  url,
  params = [],
  body: initialBody,
  headers: initialHeaders = {},
  className,
}: ApiPlaygroundProps) {
  const [paramValues, setParamValues] = React.useState<Record<string, string>>(() => {
    const vals: Record<string, string> = {};
    for (const p of params) {
      vals[p.name] = p.defaultValue || "";
    }
    return vals;
  });
  const [bodyValue, setBodyValue] = React.useState(initialBody || "");
  const [response, setResponse] = React.useState<{
    status: number;
    statusText: string;
    body: string;
    time: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function buildUrl(): string {
    let finalUrl = url;
    const queryParams = new URLSearchParams();

    for (const p of params) {
      const val = paramValues[p.name] || "";
      if (p.in === "path") {
        finalUrl = finalUrl.replace(`{${p.name}}`, encodeURIComponent(val));
      } else if (p.in === "query" && val) {
        queryParams.set(p.name, val);
      }
    }

    const qs = queryParams.toString();
    return qs ? `${finalUrl}?${qs}` : finalUrl;
  }

  async function sendRequest() {
    setLoading(true);
    setError(null);
    setResponse(null);

    const start = performance.now();
    const reqUrl = buildUrl();

    const headers: Record<string, string> = { ...initialHeaders };
    for (const p of params) {
      if (p.in === "header" && paramValues[p.name]) {
        headers[p.name] = paramValues[p.name];
      }
    }

    const hasBody = ["POST", "PUT", "PATCH"].includes(method) && bodyValue;
    if (hasBody && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const res = await fetch(reqUrl, {
        method,
        headers,
        body: hasBody ? bodyValue : undefined,
      });

      const elapsed = Math.round(performance.now() - start);
      let text: string;
      try {
        const json = await res.json();
        text = JSON.stringify(json, null, 2);
      } catch {
        text = await res.text();
      }

      setResponse({ status: res.status, statusText: res.statusText, body: text, time: elapsed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("bd-playground", className)}>
      {/* Header */}
      <div className="bd-playground-header">
        <span className={cn("bd-playground-method", methodColors[method])}>
          {method}
        </span>
        <code className="bd-playground-url">{url}</code>
        <button
          className="bd-playground-send"
          onClick={sendRequest}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Parameters */}
      {params.length > 0 && (
        <div className="bd-playground-params">
          {params.map((p) => (
            <div key={p.name} className="bd-playground-param">
              <label className="bd-playground-label">
                <span>{p.name}</span>
                <span className="bd-playground-param-meta">
                  {p.in}
                  {p.required && <span className="bd-playground-required">*</span>}
                </span>
              </label>
              <input
                type="text"
                className="bd-playground-input"
                value={paramValues[p.name] || ""}
                placeholder={p.description || p.type || ""}
                onChange={(e) =>
                  setParamValues((prev) => ({ ...prev, [p.name]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      {["POST", "PUT", "PATCH"].includes(method) && (
        <div className="bd-playground-body-section">
          <label className="bd-playground-label">Request Body</label>
          <textarea
            className="bd-playground-textarea"
            value={bodyValue}
            onChange={(e) => setBodyValue(e.target.value)}
            rows={6}
            placeholder='{ "key": "value" }'
          />
        </div>
      )}

      {/* Response */}
      {(response || error) && (
        <div className="bd-playground-response">
          {error ? (
            <div className="bd-playground-error">{error}</div>
          ) : response ? (
            <>
              <div className="bd-playground-response-header">
                <span
                  className={cn(
                    "bd-playground-status",
                    response.status < 300 ? "bd-status-ok" : "bd-status-err"
                  )}
                >
                  {response.status} {response.statusText}
                </span>
                <span className="bd-playground-time">{response.time}ms</span>
              </div>
              <pre className="bd-playground-pre">
                <code>{response.body}</code>
              </pre>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
