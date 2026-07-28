# Usage Guide

This covers how to actually use PLInt once it's running — either your own
deployment or a local dev server.

## The basics

Pick a language from the sidebar, write code in the editor, and press
**Ctrl+Enter** (or the Run button) to execute it. Output — stdout, stderr,
and any compiler diagnostics — shows up in the terminal pane on the right.

Languages fall into two execution categories, though this is mostly
invisible day to day:

- **Runs in your browser**: JavaScript, TypeScript, Python, Lua, SQL, Ruby,
  PHP, Brainfuck, CoffeeScript, HTML (live preview), and Markdown (live
  preview). Nothing leaves your machine.
- **Runs on the server**: everything else. Your code is sent to the
  `/api/execute` endpoint, run in a temporary sandboxed workspace, and the
  result comes back. See [ARCHITECTURE.md](ARCHITECTURE.md) for exactly how
  that sandboxing works.

## Files

The file icon in the toolbar opens the file manager, where you can save the
current buffer, rename or delete saved files, download a file to disk, or
import a previously exported `.json` bundle. Files are stored in your
browser's local storage — they aren't synced anywhere, and clearing your
browser data will remove them. Export regularly if you want a backup.

Deleting a file asks for confirmation by default; this can be turned off in
**Settings → Workspace → Confirm before deleting files**.

## The secret menu

Not every language shows up in the sidebar by default — the full set of
150+ languages would be a lot to page through for a first-time visitor.
Head to **Settings → Secret Menu** to toggle on the "weird," esoteric, and
assembly-language groups individually.

### Submitting a new Assembly variant

At the bottom of the Assembly section is a **"Don't see your Assembly?
Submit it now!"** button. It asks for the name of the variant you'd like
supported, checks it against what's already available, and — if it's new —
records it for the person running this instance to review. You'll get a
confirmation either way. These submissions aren't visible anywhere in the
app; they're written to a text file the server operator can read from their
own terminal (see [DEPLOY.md](DEPLOY.md)).

## Settings

**Editor** settings (font size, tab size, cursor style, minimap, whitespace
rendering, smooth scrolling, format-on-paste, line-highlight style, an
80-column ruler, and more) affect the Monaco editor itself.

**Workspace** settings affect the app shell: auto-save, delete
confirmations, auto-run after you stop typing, terminal font size, and
which language loads by default.

**Appearance** settings cover theme (light/dark), accent color — including
a full custom color picker (drag the saturation/value square, or type a
hex code directly) — density, and motion/animation preferences.

## Esoteric and assembly languages — what to expect

A handful of the esoteric languages (Whitespace, Befunge, LOLCODE, Chef,
ArnoldC, Rockstar, Deadfish, Ook!, Binary) have complete, tested
interpreters built into PLInt and behave exactly as their specs describe.

A few others are inherently ambiguous or don't have one agreed-upon
reference implementation, and PLInt documents this rather than pretending
otherwise:

- **Shakespeare Programming Language**: character values ("poetic
  compliments") are computed with a simplified doubling rule, which covers
  common patterns but not every edge case of the full spec.
- **INTERCAL**: array declaration, indexed assignment, and `READ OUT` are
  supported; some of the classic tutorials' obfuscated-numeral tricks for
  encoding text aren't reproduced, since the exact intended decoding isn't
  something that can be guessed reliably.
- **Chicken**: this language's own spec is famously disputed/joke-like;
  PLInt uses a simple, internally-consistent instruction mapping based on
  "chicken" word counts per line.
- **Piet**: source is a 2D image, not text, so PLInt can't execute it —
  you'll get an explanatory message instead. Use a dedicated tool like
  `npiet` locally.
- **Malbolge / Malbolge Unshackled**: deliberately not executed in-app.
  Their encryption/rotation tables are notoriously easy to get subtly
  wrong without a reference to check against, and a silently-wrong answer
  would be worse than an honest "not supported here." If a `malbolge`
  binary is installed on the server, PLInt will use it automatically.

Every other assembly-language entry (x86, ARM, RISC-V, the Apollo Guidance
Computer, and everything in between) runs on one shared, pedagogical
assembly simulator rather than a real per-architecture toolchain — see
[ARCHITECTURE.md](ARCHITECTURE.md) for why that's the more honest and more
resource-friendly choice for a hobby personal server.

## When something says "not installed"

Server-executed mainstream languages (Rust, Go, Haskell, Java, and so on)
depend on that language's real compiler or interpreter being installed on
the machine running PLInt. If it isn't, you'll get a clear message saying
exactly what to install rather than a confusing failure. If you're the one
running the server, see `scripts/install-interpreters.sh` and
[DEPLOY.md](DEPLOY.md).
