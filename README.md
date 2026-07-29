# PLInt - Programming Language Interpreter Hub

PLInt is a browser-based playground for writing and running code in a very
large number of programming languages - from the everyday (Python,
JavaScript, Go, Rust) to the obscure (Whitespace, Shakespeare, INTERCAL) to
dozens of assembly-language variants, real and historical.

It's a single self-hostable web app: no accounts, local-first file
management, and a server-side execution backend you run yourself.

## Features

- **150+ languages** across mainstream, "weird," esoteric, and assembly
  categories, with real syntax highlighting via Monaco (the VS Code editor).
- **In-browser execution** for JavaScript, TypeScript, Python, Lua, SQL,
  Ruby, PHP, Brainfuck, CoffeeScript, HTML, and Markdown - no server round
  trip needed.
- **Server-side execution** for everything else, dispatched to real system
  interpreters/compilers where available, a shared assembly simulator for
  the assembly-language family, and hand-written interpreters for esoteric
  languages that have no standard package.
- **A file manager** for saving, renaming, and organizing snippets per
  language, backed by local storage.
- **A "secret menu"** to unlock the weird/esoteric/assembly language groups,
  plus a form to request a new assembly variant.
- **Deep customization**: themes, accent colors (including a full custom
  color picker), density, motion, and a long list of editor/workspace
  settings.

## Quick start (local development)

```bash
npm install
npm run dev
```

This starts the app in development mode. Code you write for browser-executed
languages (JS, Python, etc.) runs immediately, no setup required. Everything
else needs the server-side execution backend, which works out of the box in
`npm run dev` too - it just calls out to whatever interpreters are already
installed on your machine, and tells you what's missing otherwise.

## Deploying your own instance

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for a full guide to running PLInt
on your own server (Node + PM2, behind Cloudflare Tunnel or any reverse
proxy), including auto-updates via GitHub webhooks.

## Documentation

See [docs/README.md](docs/README.md) for the full documentation index.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React, file-based routing,
  server routes) on [Vite](https://vite.dev)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code
  editor
- [Tailwind CSS](https://tailwindcss.com) v4 for styling
- Plain Node.js (via [Nitro](https://nitro.build)'s `node-server` preset)
  for the production server - no Docker, no cloud lock-in

## License

AGPL-3.0 - see [LICENSE](LICENSE).

## Origins

This project started as a prototype built with [Lovable](https://lovable.dev)
and has since been extended and is maintained independently.
