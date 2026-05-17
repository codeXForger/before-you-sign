# Contributing to Before You Sign

Thanks for your interest in improving this project! Contributions of all kinds are welcome — bug fixes, features, docs, and ideas.

## Ground rules

- **Don't push to `main`.** `main` is protected. All changes land through pull requests.
- **Work on a fork or a branch.** External contributors: fork the repo. Collaborators: create a feature branch.
- **Keep the BYOK / no-persistence guarantees intact.** Do **not** add a database, server-side API-key storage, analytics, telemetry, or third-party tracking. These are core to the project's trust model.
- **This is not legal-advice software.** Don't add language or features that present output as authoritative legal counsel.

## Workflow

1. **Fork** the repository (or branch, if you're a collaborator).
2. **Create a branch** with a descriptive name:
   ```bash
   git checkout -b fix/pdf-size-validation
   ```
3. **Make your change.** Match the existing code style (TypeScript, functional React components, Tailwind utility classes — no new styling system).
4. **Verify it builds.** This must pass before you open a PR:
   ```bash
   npm install
   npm run build
   ```
5. **Commit** with a clear message (see below).
6. **Push** your branch and **open a Pull Request** against `main`.
7. Fill out the PR template. Link any related issue.
8. A maintainer reviews. Address feedback by pushing more commits to the same branch.

## Commit messages

Use clear, imperative messages. Conventional Commits style is appreciated but not required:

```
feat: add DOCX upload support
fix: reject encrypted PDFs with a clear error
docs: clarify Vercel timeout caveat in README
```

## What makes a good PR

- **Focused.** One logical change per PR. Split unrelated changes.
- **Builds clean.** `npm run build` passes (typecheck + production build).
- **No secrets.** Never commit API keys, `.env` files, or `.vercel/`.
- **Explains the why.** The PR description should say what problem it solves, not just what it does.
- **Updates docs** if behavior or setup changes (README, this file, comments).

## Project layout

See the **Project structure** section in [README.md](./README.md). In short:

- `app/` — pages and the `/api/analyze` route
- `components/` — UI
- `lib/` — models, pricing, prompts, schema, exports

Most contributions touch `lib/` (models, pricing, prompt tuning) or `components/` (UI).

## Reporting bugs / requesting features

Open an issue using the templates. For bugs, include the exact error message shown in the UI (it names the failing field) and the model you used. Never paste your API key or the contents of a private agreement.

## Security issues

Do **not** open a public issue for security vulnerabilities. See [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree your contributions are licensed under the project's [MIT License](./LICENSE).
