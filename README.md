# Before You Sign

An open-source, AI-powered risk scanner for contracts and agreements. Upload a PDF, pick a Claude model, paste your own Anthropic API key, and get back a structured analysis: an overall risk score, a plain-English summary, and findings grouped by severity (**Critical / High / Medium / Low**) with section references, verbatim quotes, and suggested negotiation points.

**Live:** <https://before-you-sign-app.vercel.app>

**Bring your own Anthropic API key (BYOK).** No database, no accounts, no server-side storage. Your key is sent with a single request and forgotten when the response returns.

> ⚠️ This is not legal advice. It's a triage tool. For important agreements, consult a qualified lawyer.

---

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Prerequisites](#prerequisites)
- [Quick start (local)](#quick-start-local)
- [Getting an Anthropic API key](#getting-an-anthropic-api-key)
- [Configuration](#configuration)
- [Deploying your own copy](#deploying-your-own-copy)
- [Security model](#security-model)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **PDF upload** — drag-and-drop, up to 32 MB / 100 pages. Sent straight to Claude's native PDF support, so scanned / image-only PDFs work too (no separate OCR step).
- **Model picker** — choose any supported Claude model (Opus / Sonnet / Haiku, current and older). Default is Opus 4.5.
- **Calibrated 0–100 risk score** with a Critical / High / Medium / Low band.
- **Findings grouped by severity**, each with a section/heading reference, a verbatim quote, and a concrete negotiation point.
- **Cost transparency** — an estimated cost range before you scan, and the exact cost (token breakdown) after.
- **Export** — download the report as Markdown or PDF.
- **BYOK key handling** — stored per-tab in `sessionStorage` by default, or opt-in `localStorage` ("Remember on this device").
- **Hardened headers** — CSP, HSTS, `X-Frame-Options: DENY`, no third-party connections from the browser.

## How it works

```
Browser                         Your server (Next.js API route)         Anthropic
───────                         ───────────────────────────────         ─────────
pick model + PDF + API key
        │  multipart POST /api/analyze
        │  Authorization: Bearer <key>
        ├───────────────────────────────►  validate (PDF, size, model)
        │                                   base64-encode PDF
        │                                   ├──────────────────────────►  messages.create
        │                                   │                              (document block +
        │                                   │                               tool_use schema)
        │                                   ◄──────────────────────────┤  structured JSON
        │                                   validate with zod
        ◄───────────────────────────────┤  { analysis, usage }
render score / risks / cost
```

The API key never touches a database or disk. The PDF is held in memory only for the duration of the request.

## Prerequisites

- **Node.js 20.16+ or 22 LTS** (Next.js 16 requires `>=20.16.0 || >=22.3.0`; older 20.x may print an engine warning but can still build).
- **npm** (ships with Node). pnpm/yarn/bun also work if you prefer.
- An **Anthropic API key** (see below). You don't need this to run the dev server — only to actually scan a document.

## Quick start (local)

```bash
# 1. Clone
git clone <your-fork-or-this-repo-url>
cd before-you-sign

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open <http://localhost:3000>:

1. Paste your Anthropic API key into the **API key** field.
2. Pick a model (Opus 4.5 by default).
3. Drag a contract PDF onto the drop zone.
4. Click **Analyze agreement**.
5. Review the score + findings, then optionally download the Markdown/PDF report.

There are **no environment variables to configure** — the app is BYOK by design. The provided `.env.example` is intentionally empty and documents this.

Production build (optional, to verify before deploying):

```bash
npm run build
npm run start   # serves the production build on http://localhost:3000
```

## Getting an Anthropic API key

1. Go to <https://console.anthropic.com/settings/keys>.
2. Create a key (it starts with `sk-ant-...`).
3. Make sure the key's workspace has credit / billing enabled and access to the models you intend to use.

The key is billed **to your own Anthropic account**. The app shows an estimated cost before each scan and the exact cost after.

## Configuration

Everything configurable lives in `lib/`:

| What | File | How |
|------|------|-----|
| **Available models** | [`lib/models.ts`](./lib/models.ts) | Add/remove/reorder entries in `MODELS`. The dropdown auto-groups by tier (Opus/Sonnet/Haiku). |
| **Default model** | [`lib/models.ts`](./lib/models.ts) | Change `DEFAULT_MODEL_ID`. |
| **Pricing (for cost display)** | [`lib/pricing.ts`](./lib/pricing.ts) | Update `PRICING` (USD per million tokens). Verify against <https://www.anthropic.com/pricing>. |
| **Analysis prompt & rubric** | [`lib/prompts.ts`](./lib/prompts.ts) | Edit `SYSTEM_PROMPT` to change scoring behavior. |
| **Output schema** | [`lib/analysis-schema.ts`](./lib/analysis-schema.ts) | Change the zod schema *and* the matching `analysisJsonSchema` together. |
| **Upload size limit** | [`app/api/analyze/route.ts`](./app/api/analyze/route.ts) | `MAX_FILE_BYTES` (default 32 MB). |
| **Security headers** | [`next.config.ts`](./next.config.ts) | CSP and other headers. |

## Deploying your own copy

The app is a standard Next.js 16 app and runs anywhere Next.js does. **Vercel** is the smoothest (native Next.js, free tier, automatic HTTPS, no env vars to set).

### Option A — Vercel via GitHub (easiest, auto-deploys on push)

1. Push this repo to your own GitHub account.
2. Go to <https://vercel.com/new> and import the repository.
3. Accept the detected defaults (Framework: Next.js). **Leave environment variables empty.**
4. Click **Deploy**. Every future `git push` redeploys automatically.

### Option B — Vercel CLI (no GitHub needed)

```bash
npx vercel@latest login      # one-time, interactive browser auth
npx vercel@latest link       # one-time, creates/links the project
npx vercel@latest            # preview deploy (throwaway URL)
npx vercel@latest --prod     # production deploy
```

### Option C — anywhere else

Any Node host works (Railway, Render, Fly.io, a VPS, Docker):

```bash
npm install
npm run build
npm run start    # listens on $PORT (default 3000)
```

### ⚠️ Serverless timeout note

`app/api/analyze/route.ts` sets `maxDuration: 120`. On **Vercel's free Hobby plan, functions are capped at 60s**. Most PDFs finish well under that, but a large/long contract on a slow model can hit a 504. If that happens:

- Set a faster default model (Sonnet 4.6 / Haiku 4.5) in `lib/models.ts`, **or**
- Upgrade to Vercel Pro (300s limit), **or**
- Host on a platform without function timeouts (Railway/Render/Fly/VPS).

## Security model

- The API key is read **only** from the `Authorization: Bearer …` header on `/api/analyze`. It is never logged, never written to disk, never echoed back in a response.
- Uploaded PDFs are base64-encoded in memory and discarded when the request returns. No database, no temp files, no persistence.
- The browser only talks to this app's own API route. The Anthropic call is made server-side.
- In the browser, the key is stored in `sessionStorage` (cleared when the tab closes) unless the user explicitly opts into `localStorage` via "Remember on this device".
- Server-side validation: PDF MIME type only, non-empty, max 32 MB.
- Response headers (`next.config.ts`): `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, restrictive `Permissions-Policy`.
- No analytics, no telemetry, no third-party scripts.

## Project structure

```
app/
  layout.tsx                 Root layout + metadata
  page.tsx                   Single-page UI (client component)
  api/analyze/route.ts       POST endpoint: validate → Claude → validated JSON
components/                  ApiKeyInput, ModelSelector, FileDropzone,
                             ScoreCard, SummaryPanel, RiskList, RiskItem,
                             CostEstimate, CostBreakdown, ExportButtons
lib/
  models.ts                  Model catalog + default
  pricing.ts                 Rates, cost + estimate helpers
  prompts.ts                 System prompt + tool definition
  analysis-schema.ts         zod schema + JSON schema for tool_use
  anthropic.ts               SDK client factory
  markdown-export.ts         Markdown report builder
  pdf-export.ts              PDF report builder (jspdf)
next.config.ts               Security headers
```

## Troubleshooting

| Symptom | Cause / fix |
|--------|-------------|
| `Missing API key` (401) | Paste a valid `sk-ant-...` key in the API key field. |
| `Anthropic rejected the API key` (401) | Key is wrong, revoked, or its workspace has no billing. |
| `This API key does not have access to the selected model` (403) | Pick a different model, or enable that model on your Anthropic account. |
| `The analysis was cut off … output token budget` (502) | Very long document. Retry, or try a shorter PDF / different model. |
| 504 timeout on Vercel | Hobby 60s function cap — see the [timeout note](#️-serverless-timeout-note). |
| `Model returned an analysis in an unexpected shape` | Rare; retry. The error now names the offending field; open an issue with it if it persists. |
| Engine warning on `npm install` | Node < 20.16. Upgrade to Node 20.16+ or 22 LTS. |

## Contributing

Issues and PRs welcome. For changes:

```bash
npm run build   # must pass (typecheck + build) before opening a PR
```

Keep the BYOK / no-persistence guarantees intact — don't add a database, server-side key storage, or third-party tracking.

## License

MIT — see [LICENSE](./LICENSE).
