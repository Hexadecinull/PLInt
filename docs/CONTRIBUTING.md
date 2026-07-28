# Contributing to PLInt

Thanks for considering a contribution. This is a personal/hobby project,
so response times may vary, but PRs and issues are genuinely welcome.

## Before you start

For anything beyond a small fix (typo, obvious bug), please open an issue
first to discuss the change. This is especially true for:

- Adding a new language to the catalog (`src/lib/languages.ts`) — there
  are a lot already, and additions should have a real execution path (see
  [ARCHITECTURE.md](ARCHITECTURE.md)), not just a catalog entry with no
  backend.
- Changes to the execution sandboxing model (`src/lib/server/sandbox.ts`)
  — these have security implications, see [SECURITY.md](SECURITY.md).
- Anything touching the settings schema (`src/lib/settings.ts`) — it's
  persisted to users' local storage, so changes need a sensible default
  and shouldn't break existing stored settings.

## Development setup

```bash
git clone <your fork>
cd PLInt
npm install
npm run dev
```

See [DEPLOY.md](DEPLOY.md) if you want to test the server-execution
backend against real interpreters locally — `npm run dev` uses the same
`/api/execute` route as production, so anything installed on your
machine's `PATH` will work.

## Code style

- **TypeScript**, strict-ish — avoid `any` where a real type is easy to
  write.
- Run `npm run lint` and `npm run format` before committing; CI runs
  ESLint and a Prettier check on every push and PR (see
  `.github/workflows/lint.yml`).
- Keep comments purposeful and short — explain *why*, not *what the code
  obviously does*.
- Match the existing patterns in a file rather than introducing a new
  style locally (e.g., follow `asm()`'s helper-function pattern when
  adding assembly languages, follow the `NativeSpec` table shape when
  adding a native-language runner).

## Adding a new language

1. Add a `LanguageDef` entry to the appropriate array in
   `src/lib/languages.ts` (`CORE`, `WEIRD`, `ESOTERIC`, or `ASSEMBLY`).
2. If Monaco doesn't ship syntax highlighting for it natively, add a
   Monarch tokenizer in `src/lib/monaco-languages.ts`.
3. Wire up execution:
   - Fits in the browser (like CoffeeScript or Markdown)? Add a runner to
     `src/lib/runners/browser.ts` and register it in `src/lib/runners/index.ts`.
   - Needs a real system interpreter/compiler? Add an entry to `SPECS` in
     `src/lib/server/native.ts`.
   - Genuinely esoteric with no standard package? Add an interpreter to
     `src/lib/server/esoteric.ts` and register it in
     `src/lib/server/registry.ts`.
4. **Test it.** Run the sample code you wrote through the real interpreter
   before opening a PR — several bugs have been found this way in both
   sample programs and interpreter logic during this project's history.
   If you're adding a hand-written interpreter, include a small test
   script or note in the PR description showing it against the bundled
   sample.

## Pull requests

- Keep PRs focused — one language addition or one bug fix per PR is easier
  to review than a grab-bag.
- Describe what you tested and how, especially for anything touching code
  execution.
- Update relevant docs in `docs/` if behavior changes.

## Reporting bugs

Open a GitHub issue with:

- What you expected vs. what happened.
- The language involved, if applicable, and a minimal code sample.
- Whether it's a browser-side or server-side language (see
  [ARCHITECTURE.md](ARCHITECTURE.md) if you're not sure).

For security issues, see [SECURITY.md](SECURITY.md) instead of a public
issue.

## Code of Conduct

Participation in this project means agreeing to
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
