# Architecture

## Overview

PLInt is a [TanStack Start](https://tanstack.com/start) app — React on the
frontend, file-based routing, and server routes (API endpoints) in the same
codebase, built with Vite and served in production as a plain Node process
via [Nitro](https://nitro.build)'s `node-server` preset.

```
src/
  routes/            File-based routes (pages + API endpoints)
    index.tsx         Landing page
    app.tsx            The editor workspace
    api.execute.ts      POST /api/execute — runs server-side languages
    api.submit-assembly.ts  POST /api/submit-assembly — the "submit your
                             assembly" form
  components/          UI: EditorPane, OutputPane, Toolbar, FileManager,
                       LanguageSidebar, SettingsPanel
  lib/
    languages.ts       The full language catalog (CORE, WEIRD, ESOTERIC,
                       ASSEMBLY) — one array of metadata per language
    monaco-languages.ts  Custom Monarch tokenizers for languages Monaco
                       doesn't ship out of the box
    settings.ts         Persisted user settings + theme application
    secret.ts           Which language groups are unlocked
    dialogs.tsx          Custom alert/confirm/prompt system
    runners/            Client-side dispatch: routes each language to a
                       browser runtime or the /api/execute endpoint
    server/              The actual server-side execution backend
      registry.ts         Top-level dispatcher
      native.ts            Config-driven dispatch to real system
                          interpreters/compilers (~50 languages)
      asmvm.ts              The shared assembly simulator
      esoteric.ts            Hand-written interpreters for esoteric
                          languages with no standard system package
      sandbox.ts            Process spawning: temp workspace, timeout,
                          memory limits, output caps
```

## The language catalog

Every language is one `LanguageDef` entry in `src/lib/languages.ts`:

```ts
interface LanguageDef {
  id: string;            // stable identifier, used in the UI and storage
  name: string;
  monaco: string;        // Monaco language id for syntax highlighting
  runtime: RuntimeKind;   // where/how it executes
  serverId?: string;      // id sent to /api/execute (defaults to `id`)
  ext: string;
  sample: string;         // starter code shown when you select the language
  group?: "weird" | "esoteric" | "assembly"; // omitted = core/default-visible
  syntax: { comment, variable, fn, io, loop, conditional };
}
```

`runtime` is one of: `js`, `ts`, `python`, `lua`, `sql`, `ruby`, `php`,
`html`, `markdown`, `coffeescript`, `brainfuck` (all run in the browser), or
`server` (dispatched to `/api/execute`).

## Client-side execution (`src/lib/runners/browser.ts`)

Browser-executed languages load their runtime lazily from a CDN on first
use (Pyodide for Python, a Lua VM compiled to WASM, sql.js, the TypeScript
compiler, the CoffeeScript compiler, `marked` + DOMPurify for Markdown) and
cache the loaded module. Nothing is bundled into the app itself, keeping
the initial page load light.

## Server-side execution (`src/lib/server/`)

`POST /api/execute` receives `{ languageId, language, code }` and returns
`{ stdout, stderr, ok, diagnostics, durationMs }`. `registry.ts` routes the
request based on `serverId`:

1. **`asm-*` ids** → the shared assembly VM (`asmvm.ts`).
2. **`wat` / `llvm` / `jasmin` / `cil`** → dedicated handlers that check for
   a real toolchain (`wat2wasm`, `lli`, Jasmin + a JDK, `ilasm` + Mono) and
   give a clear install hint if it's missing.
3. **Esoteric-language ids** → the corresponding hand-written interpreter
   in `esoteric.ts`.
4. **Everything else** → `native.ts`, a config table mapping each language
   to a real system interpreter/compiler invocation.

### Why one shared assembly simulator instead of real per-architecture toolchains

The assembly-language catalog spans roughly 50 variants, from x86 and ARM
to genuinely obscure or vendor-specific historical architectures (the
Apollo Guidance Computer, the CDC 6600, Transmeta's Crusoe). A handful of
these have real, freely available cross-assemblers and emulators; most
don't, and the ones that do would mean installing several different
multi-hundred-megabyte cross-compiler toolchains plus QEMU targets — a lot
of disk and RAM for a personal server, for a feature whose bundled sample
programs were never architecture-accurate to begin with (they're generated
from one shared placeholder).

So instead, every plain assembly entry runs on one small, dependency-free,
pedagogical simulator: 8 registers, `mov`/`add`/`sub`/`mul`/`div`, `cmp` +
conditional jumps, `push`/`pop`, `call`/`ret`, and `print`/`prints` for
output. It is **not** a cycle-accurate emulator of any real hardware — it's
a consistent teaching model that runs instantly with zero install cost,
which is both more honest (no false claim of hardware accuracy) and a much
better fit for a resource-constrained box.

`wat`, `llvm` IR, Jasmin, and CIL are excluded from this VM because they're
structured bytecode/IR formats, not flat register-tape assembly — running
them through the simulator's syntax would silently produce nonsense against
real-looking source. They get their own real-toolchain-or-graceful-message
handlers instead.

### Why some esoteric languages are "best-effort"

Most esoteric-language interpreters here (Whitespace, Befunge-93, Ook!,
Deadfish, LOLCODE, ArnoldC, Rockstar, Chef, Binary) implement their full,
well-documented specs and are tested against the exact sample programs
bundled with each language.

A few — Shakespeare, INTERCAL, and Chicken — have genuinely ambiguous or
disputed specs (see [USAGE.md](USAGE.md) for specifics). Rather than
fabricate a "correct" answer for details that can't be verified, PLInt
implements a documented, internally-consistent subset and says so. Malbolge
and Malbolge Unshackled go a step further and aren't executed in-app at
all — their encryption tables are exactly the kind of detail that's easy to
get subtly (and silently) wrong from memory, and a wrong answer there would
actively mislead someone trying to debug already-difficult code.

### Sandboxing model

Every server-side execution:

- Runs in a freshly created temp directory, deleted afterward.
- Is wrapped in `nice -n 15` (low CPU priority) and `ulimit -v` (a virtual
  memory ceiling, default 256MB).
- Has a hard wall-clock timeout (default 10s), after which the process is
  sent `SIGKILL`.
- Has its stdout/stderr capped at 200KB each.

This is process-level sandboxing (resource limits + a scratch directory),
**not** a hardened multi-tenant sandbox — no seccomp, no container, no
network namespace isolation. That's an appropriate trade-off for a personal
instance you and people you trust use, not for a public-facing service
accepting arbitrary code from strangers. See [SECURITY.md](SECURITY.md).

## Auto-updates

See [DEPLOY.md](DEPLOY.md) for the GitHub-webhook-triggered auto-update
flow (`scripts/deploy/webhook-server.js` → `scripts/deploy/update.sh` →
`pm2 reload`).
