import * as React from "react";
import { cn } from "../../lib/utils.js";

interface ParamDef {
  name: string;
  in: "query" | "path" | "header" | "body";
  type?: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
  enum?: string[];
}

interface ApiPlaygroundProps {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  params?: ParamDef[];
  body?: string;
  headers?: Record<string, string>;
  className?: string;
}

interface HistoryEntry {
  id: number;
  method: string;
  url: string;
  status: number;
  statusText: string;
  time: number;
  size: number;
  body: string;
  headers: [string, string][];
  timestamp: number;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bd-method-get",
  POST: "bd-method-post",
  PUT: "bd-method-put",
  PATCH: "bd-method-patch",
  DELETE: "bd-method-delete",
};

type SnippetLang = "curl" | "javascript" | "python" | "node";
type ResponseTab = "body" | "headers" | "code";

const SNIPPET_LABELS: Record<SnippetLang, string> = {
  curl: "cURL",
  javascript: "JavaScript",
  python: "Python",
  node: "Node.js",
};

const DB_NAME = "barodoc-api-playground";
const DB_VERSION = 1;
const STORE_NAME = "history";
const MAX_HISTORY = 5;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = (req.result as HistoryEntry[]).sort((a, b) => b.timestamp - a.timestamp);
        resolve(items.slice(0, MAX_HISTORY));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

async function saveHistory(entry: Omit<HistoryEntry, "id">): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.add(entry);

    const allReq = store.getAll();
    allReq.onsuccess = () => {
      const items = (allReq.result as HistoryEntry[]).sort((a, b) => b.timestamp - a.timestamp);
      const toDelete = items.slice(MAX_HISTORY);
      for (const item of toDelete) {
        store.delete(item.id);
      }
    };
  } catch {
    // IndexedDB unavailable — silent fail
  }
}

function generateSnippet(
  lang: SnippetLang,
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: string,
): string {
  switch (lang) {
    case "curl": {
      const parts = [`curl -X ${method} '${url}'`];
      for (const [k, v] of Object.entries(headers)) {
        parts.push(`  -H '${k}: ${v}'`);
      }
      if (body) parts.push(`  -d '${body}'`);
      return parts.join(" \\\n");
    }
    case "javascript": {
      const opts: string[] = [`  method: "${method}"`];
      if (Object.keys(headers).length > 0) {
        opts.push(`  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")}`);
      }
      if (body) opts.push(`  body: JSON.stringify(${body})`);
      return `const response = await fetch("${url}", {\n${opts.join(",\n")}\n});\nconst data = await response.json();\nconsole.log(data);`;
    }
    case "python": {
      const lines = ["import requests", ""];
      if (body) {
        lines.push(`response = requests.${method.toLowerCase()}(`);
        lines.push(`    "${url}",`);
        if (Object.keys(headers).length > 0) {
          lines.push(`    headers=${pythonDict(headers)},`);
        }
        lines.push(`    json=${body}`);
        lines.push(")");
      } else {
        lines.push(`response = requests.${method.toLowerCase()}(`);
        lines.push(`    "${url}"${Object.keys(headers).length > 0 ? "," : ""}`);
        if (Object.keys(headers).length > 0) {
          lines.push(`    headers=${pythonDict(headers)}`);
        }
        lines.push(")");
      }
      lines.push("print(response.json())");
      return lines.join("\n");
    }
    case "node": {
      const lines = ['const axios = require("axios");', ""];
      const config: string[] = [];
      if (Object.keys(headers).length > 0) {
        config.push(`  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")}`);
      }
      if (body) config.push(`  data: ${body}`);
      lines.push(`const { data } = await axios({`);
      lines.push(`  method: "${method}",`);
      lines.push(`  url: "${url}",`);
      if (config.length > 0) lines.push(config.join(",\n") + ",");
      lines.push("});");
      lines.push("console.log(data);");
      return lines.join("\n");
    }
  }
}

function pythonDict(obj: Record<string, string>): string {
  const entries = Object.entries(obj).map(([k, v]) => `"${k}": "${v}"`);
  if (entries.length <= 2) return `{${entries.join(", ")}}`;
  return `{\n        ${entries.join(",\n        ")}\n    }`;
}

function highlightJson(text: string): React.ReactNode[] {
  const withValues = text.replace(
    /("(?:[^"\\]|\\.)*")(\s*:)?|(\b(?:true|false|null)\b)|(\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/g,
    (match, str, colon, bool, num) => {
      if (str && colon) return `<k>${str}</k>${colon}`;
      if (str) return `<s>${str}</s>`;
      if (bool) return `<b>${bool}</b>`;
      if (num) return `<n>${num}</n>`;
      return match;
    },
  );

  const parts = withValues.split(/(<[ksnb]>.*?<\/[ksnb]>)/g);
  return parts.map((part, i) => {
    const keyM = part.match(/^<k>(.*)<\/k>$/);
    if (keyM) return <span key={i} className="bd-json-key">{keyM[1]}</span>;
    const strM = part.match(/^<s>(.*)<\/s>$/);
    if (strM) return <span key={i} className="bd-json-str">{strM[1]}</span>;
    const boolM = part.match(/^<b>(.*)<\/b>$/);
    if (boolM) return <span key={i} className="bd-json-bool">{boolM[1]}</span>;
    const numM = part.match(/^<n>(.*)<\/n>$/);
    if (numM) return <span key={i} className="bd-json-num">{numM[1]}</span>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  return (
    <button
      className="bd-pg-copy"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      title="Copy"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

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
    for (const p of params) vals[p.name] = p.defaultValue || "";
    return vals;
  });
  const [bodyValue, setBodyValue] = React.useState(initialBody || "");
  const [bodyError, setBodyError] = React.useState<string | null>(null);
  const [response, setResponse] = React.useState<{
    status: number;
    statusText: string;
    body: string;
    headers: [string, string][];
    time: number;
    size: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [responseTab, setResponseTab] = React.useState<ResponseTab>("body");
  const [snippetLang, setSnippetLang] = React.useState<SnippetLang>("curl");
  const [showAuth, setShowAuth] = React.useState(false);
  const [authType, setAuthType] = React.useState<"bearer" | "apikey" | "basic">("bearer");
  const [bearerToken, setBearerToken] = React.useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("bd-api-bearer") || "" : "",
  );
  const [apiKeyName, setApiKeyName] = React.useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("bd-api-keyname") || "X-API-Key" : "X-API-Key",
  );
  const [apiKeyValue, setApiKeyValue] = React.useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("bd-api-keyvalue") || "" : "",
  );
  const [basicUser, setBasicUser] = React.useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("bd-api-basic-user") || "" : "",
  );
  const [basicPass, setBasicPass] = React.useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("bd-api-basic-pass") || "" : "",
  );
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);
  const [historyView, setHistoryView] = React.useState<HistoryEntry | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("bd-api-bearer", bearerToken);
    localStorage.setItem("bd-api-keyname", apiKeyName);
    localStorage.setItem("bd-api-keyvalue", apiKeyValue);
    localStorage.setItem("bd-api-basic-user", basicUser);
    localStorage.setItem("bd-api-basic-pass", basicPass);
  }, [bearerToken, apiKeyName, apiKeyValue, basicUser, basicPass]);

  React.useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

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

  function buildLiveUrl(): string {
    let finalUrl = url;
    for (const p of params) {
      const val = paramValues[p.name];
      if (p.in === "path") {
        finalUrl = val
          ? finalUrl.replace(`{${p.name}}`, val)
          : finalUrl;
      }
    }
    const queryParts: string[] = [];
    for (const p of params) {
      if (p.in === "query" && paramValues[p.name]) {
        queryParts.push(`${p.name}=${paramValues[p.name]}`);
      }
    }
    return queryParts.length > 0 ? `${finalUrl}?${queryParts.join("&")}` : finalUrl;
  }

  function getRequestHeaders(): Record<string, string> {
    const h: Record<string, string> = { ...initialHeaders };
    for (const p of params) {
      if (p.in === "header" && paramValues[p.name]) {
        h[p.name] = paramValues[p.name];
      }
    }
    if (bearerToken && authType === "bearer") {
      h["Authorization"] = `Bearer ${bearerToken}`;
    }
    if (apiKeyValue && authType === "apikey") {
      h[apiKeyName] = apiKeyValue;
    }
    if (basicUser && authType === "basic") {
      h["Authorization"] = `Basic ${btoa(`${basicUser}:${basicPass}`)}`;
    }
    const hasBody = ["POST", "PUT", "PATCH"].includes(method) && bodyValue;
    if (hasBody && !h["Content-Type"]) {
      h["Content-Type"] = "application/json";
    }
    return h;
  }

  async function sendRequest() {
    const hasBody = ["POST", "PUT", "PATCH"].includes(method) && bodyValue;

    if (hasBody) {
      try {
        JSON.parse(bodyValue);
        setBodyError(null);
      } catch (e) {
        setBodyError(e instanceof Error ? e.message : "Invalid JSON");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    setHistoryView(null);
    setResponseTab("body");

    const start = performance.now();
    const reqUrl = buildUrl();
    const headers = getRequestHeaders();

    try {
      const res = await fetch(reqUrl, {
        method,
        headers,
        body: hasBody ? bodyValue : undefined,
      });

      const elapsed = Math.round(performance.now() - start);
      const rawText = await res.text();
      const size = new Blob([rawText]).size;
      let text: string;
      try {
        const json = JSON.parse(rawText);
        text = JSON.stringify(json, null, 2);
      } catch {
        text = rawText;
      }

      const resHeaders: [string, string][] = [];
      res.headers.forEach((v, k) => resHeaders.push([k, v]));

      const resObj = { status: res.status, statusText: res.statusText, body: text, headers: resHeaders, time: elapsed, size };
      setResponse(resObj);

      const historyEntry: Omit<HistoryEntry, "id"> = {
        method,
        url: reqUrl,
        status: res.status,
        statusText: res.statusText,
        time: elapsed,
        size,
        body: text,
        headers: resHeaders,
        timestamp: Date.now(),
      };
      await saveHistory(historyEntry);
      const updated = await loadHistory();
      setHistory(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const liveUrl = buildLiveUrl();
  const reqHeaders = getRequestHeaders();
  const hasBody = ["POST", "PUT", "PATCH"].includes(method);
  const currentSnippet = generateSnippet(
    snippetLang,
    method,
    liveUrl,
    reqHeaders,
    hasBody && bodyValue ? bodyValue : undefined,
  );

  const displayResponse = historyView || response;

  return (
    <div className={cn("bd-playground", className)}>
      {/* Header with method + live URL + send */}
      <div className="bd-playground-header">
        <span className={cn("bd-playground-method", METHOD_COLORS[method])}>
          {method}
        </span>
        <code className="bd-playground-url">{liveUrl}</code>
        <button className="bd-playground-send" onClick={sendRequest} disabled={loading}>
          {loading ? (
            <>
              <svg className="bd-pg-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Send
            </>
          )}
        </button>
      </div>

      {/* Auth toggle */}
      <div className="bd-pg-auth-bar">
        <button className="bd-pg-auth-toggle" onClick={() => setShowAuth(!showAuth)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Authentication
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: showAuth ? "rotate(180deg)" : "none", transition: "transform 200ms" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {showAuth && (
        <div className="bd-pg-auth-panel">
          <div className="bd-pg-auth-type">
            <button
              className={cn("bd-pg-auth-type-btn", authType === "bearer" && "active")}
              onClick={() => setAuthType("bearer")}
            >
              Bearer Token
            </button>
            <button
              className={cn("bd-pg-auth-type-btn", authType === "apikey" && "active")}
              onClick={() => setAuthType("apikey")}
            >
              API Key
            </button>
            <button
              className={cn("bd-pg-auth-type-btn", authType === "basic" && "active")}
              onClick={() => setAuthType("basic")}
            >
              Basic Auth
            </button>
          </div>
          {authType === "bearer" && (
            <div className="bd-playground-param">
              <label className="bd-playground-label">Token</label>
              <input
                type="text"
                className="bd-playground-input"
                value={bearerToken}
                placeholder="Enter Bearer token..."
                onChange={(e) => setBearerToken(e.target.value)}
              />
            </div>
          )}
          {authType === "apikey" && (
            <>
              <div className="bd-playground-param">
                <label className="bd-playground-label">Header Name</label>
                <input
                  type="text"
                  className="bd-playground-input"
                  value={apiKeyName}
                  placeholder="X-API-Key"
                  onChange={(e) => setApiKeyName(e.target.value)}
                />
              </div>
              <div className="bd-playground-param">
                <label className="bd-playground-label">Key Value</label>
                <input
                  type="text"
                  className="bd-playground-input"
                  value={apiKeyValue}
                  placeholder="Enter API key..."
                  onChange={(e) => setApiKeyValue(e.target.value)}
                />
              </div>
            </>
          )}
          {authType === "basic" && (
            <>
              <div className="bd-playground-param">
                <label className="bd-playground-label">Username</label>
                <input
                  type="text"
                  className="bd-playground-input"
                  value={basicUser}
                  placeholder="Username"
                  onChange={(e) => setBasicUser(e.target.value)}
                />
              </div>
              <div className="bd-playground-param">
                <label className="bd-playground-label">Password</label>
                <input
                  type="password"
                  className="bd-playground-input"
                  value={basicPass}
                  placeholder="Password"
                  onChange={(e) => setBasicPass(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Parameters */}
      {params.length > 0 && (
        <div className="bd-playground-params">
          {params.map((p) => (
            <div key={p.name} className="bd-playground-param">
              <label className="bd-playground-label">
                <span className="bd-pg-param-name">{p.name}</span>
                <span className="bd-playground-param-meta">
                  {p.in}
                  {p.required && <span className="bd-playground-required">*</span>}
                </span>
              </label>
              {p.enum && p.enum.length > 0 ? (
                <select
                  className="bd-playground-input bd-playground-select"
                  value={paramValues[p.name] || ""}
                  onChange={(e) =>
                    setParamValues((prev) => ({ ...prev, [p.name]: e.target.value }))
                  }
                >
                  <option value="">Select {p.name}...</option>
                  {p.enum.map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="bd-playground-input"
                  value={paramValues[p.name] || ""}
                  placeholder={p.description || p.type || ""}
                  onChange={(e) =>
                    setParamValues((prev) => ({ ...prev, [p.name]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      {hasBody && (
        <div className="bd-playground-body-section">
          <label className="bd-playground-label">Request Body</label>
          <textarea
            className={cn("bd-playground-textarea", bodyError && "bd-playground-textarea-error")}
            value={bodyValue}
            onChange={(e) => {
              setBodyValue(e.target.value);
              if (bodyError) setBodyError(null);
            }}
            rows={6}
            placeholder='{ "key": "value" }'
          />
          {bodyError && (
            <div className="bd-pg-body-error">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Invalid JSON: {bodyError}
            </div>
          )}
        </div>
      )}

      {/* Code Snippets */}
      <div className="bd-pg-code-section">
        <div className="bd-pg-code-tabs">
          {(Object.keys(SNIPPET_LABELS) as SnippetLang[]).map((lang) => (
            <button
              key={lang}
              className={cn("bd-pg-code-tab", snippetLang === lang && "active")}
              onClick={() => setSnippetLang(lang)}
            >
              {SNIPPET_LABELS[lang]}
            </button>
          ))}
          <CopyButton text={currentSnippet} />
        </div>
        <pre className="bd-pg-code-pre">
          <code>{currentSnippet}</code>
        </pre>
      </div>

      {/* Response */}
      {(displayResponse || error) && (
        <div className="bd-playground-response">
          {error ? (
            <div className="bd-playground-error">{error}</div>
          ) : displayResponse ? (
            <>
              <div className="bd-playground-response-header">
                <div className="bd-pg-response-meta">
                  <span
                    className={cn(
                      "bd-playground-status",
                      displayResponse.status < 300 ? "bd-status-ok" : displayResponse.status < 500 ? "bd-status-warn" : "bd-status-err",
                    )}
                  >
                    {displayResponse.status}
                  </span>
                  <span className="bd-pg-status-text">{displayResponse.statusText}</span>
                  <span className="bd-playground-time">{displayResponse.time}ms</span>
                  <span className="bd-playground-size">{formatSize(displayResponse.size)}</span>
                </div>
                <div className="bd-pg-response-tabs">
                  <button
                    className={cn("bd-pg-resp-tab", responseTab === "body" && "active")}
                    onClick={() => setResponseTab("body")}
                  >
                    Body
                  </button>
                  <button
                    className={cn("bd-pg-resp-tab", responseTab === "headers" && "active")}
                    onClick={() => setResponseTab("headers")}
                  >
                    Headers
                    <span className="bd-pg-badge">{displayResponse.headers.length}</span>
                  </button>
                </div>
              </div>

              {historyView && (
                <div className="bd-pg-history-banner">
                  Viewing history entry
                  <button className="bd-pg-history-dismiss" onClick={() => setHistoryView(null)}>
                    Back to current
                  </button>
                </div>
              )}

              {responseTab === "body" && (
                <div className="bd-pg-response-body">
                  <CopyButton text={displayResponse.body} />
                  <pre className="bd-playground-pre">
                    <code>{highlightJson(displayResponse.body)}</code>
                  </pre>
                </div>
              )}

              {responseTab === "headers" && (
                <div className="bd-pg-headers-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Header</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayResponse.headers.map(([k, v]) => (
                        <tr key={k}>
                          <td><code>{k}</code></td>
                          <td>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bd-pg-history-section">
          <button
            className="bd-pg-history-toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
            <span className="bd-pg-badge">{history.length}</span>
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: showHistory ? "rotate(180deg)" : "none", transition: "transform 200ms", marginLeft: "auto" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showHistory && (
            <div className="bd-pg-history-list">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  className={cn("bd-pg-history-item", historyView?.id === entry.id && "active")}
                  onClick={() => {
                    setHistoryView(entry);
                    setResponseTab("body");
                    setError(null);
                  }}
                >
                  <span className={cn("bd-pg-history-method", METHOD_COLORS[entry.method])}>
                    {entry.method}
                  </span>
                  <span className="bd-pg-history-url">{entry.url.replace(/^https?:\/\/[^/]+/, "")}</span>
                  <span
                    className={cn(
                      "bd-pg-history-status",
                      entry.status < 300 ? "bd-status-ok" : entry.status < 500 ? "bd-status-warn" : "bd-status-err",
                    )}
                  >
                    {entry.status}
                  </span>
                  <span className="bd-pg-history-time">{entry.time}ms</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
