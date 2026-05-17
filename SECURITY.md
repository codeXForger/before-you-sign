# Security Policy

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report privately via GitHub's **[Private vulnerability reporting](https://github.com/codeXForger/before-you-sign/security/advisories/new)** (Security tab → "Report a vulnerability").

Include:

- A description of the issue and its impact
- Steps to reproduce
- Affected files / endpoints if known

You can expect an initial response within a few days. Please give a reasonable window to address the issue before any public disclosure.

## Scope / threat model

This app is **bring-your-own-key (BYOK)** and stores nothing server-side. Particularly relevant areas:

- Handling of the Anthropic API key (it must never be logged, persisted, or returned in a response).
- The `/api/analyze` route input validation (file type, size).
- Security headers in `next.config.ts`.
- Client-side key storage (`sessionStorage` / opt-in `localStorage`).

Out of scope: the user's own Anthropic account/billing, and the contents of documents users choose to upload (these are sent to Anthropic by design — that is the product).

## Supported versions

This is a single-branch project. Only the latest `main` is supported.
