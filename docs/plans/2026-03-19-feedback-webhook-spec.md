# Feedback widget — webhook contract

**Date:** 2026-03-19  
**Status:** Spec only (theme-docs already has the UI; this doc defines the backend contract.)

## Overview

The docs layout can show a **"Was this helpful?"** block (Yes / No) in the page footer. When enabled, the client sends a POST request to a configurable endpoint. This document describes the request and optional response so you can implement a receiver (e.g. serverless function, webhook handler).

## Config

In `barodoc.config.json`:

```json
{
  "feedback": {
    "enabled": true,
    "endpoint": "https://your-api.com/docs-feedback"
  }
}
```

- **enabled** — Show the feedback block.
- **endpoint** — URL that will receive POST requests. If omitted, the buttons still appear but no request is sent.

## Request

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:** JSON object

| Field   | Type   | Description |
|--------|--------|-------------|
| `page` | string | Current pathname (e.g. `/docs/guides/configuration`) |
| `value` | string | `"yes"` or `"no"` |

Example:

```json
{
  "page": "/docs/guides/configuration",
  "value": "yes"
}
```

The client does not send cookies or auth headers. If you need to identify users or avoid duplicates, implement that in your backend (e.g. require a token, or accept anonymous feedback and dedupe by IP/session in your own logic).

## Response

The client ignores the response body and status code (it does not retry on 4xx/5xx). Any 2xx is fine for success. Recommended: return `204 No Content` or `200 OK`.

## Backend ideas

- **Serverless:** e.g. Vercel/Netlify function that appends to a sheet, sends to Slack, or writes to a DB.
- **Analytics:** Forward to your analytics (e.g. custom event with `page` and `value`).
- **Storage:** Append to a CSV, Airtable, or Postgres table for later analysis.

## Future (out of scope for this spec)

- Optional comment field (would require theme change).
- Rate limiting / abuse protection (backend responsibility).
- Dedicated `@barodoc/plugin-feedback` that ships a default serverless handler (optional follow-up).
