// Browser-side runners. Runtimes are lazy-loaded from CDNs the first time
// each language is used so the initial bundle stays small.

import type { RunResult, Diagnostic } from "./types";
import { emptyResult } from "./types";

// -------- shared loader helpers --------


// Dynamic-import URLs via a variable so TypeScript's module resolver doesn't
// try to resolve remote URLs at build time.
const cdnImport = (url: string): Promise<any> =>
  (new Function("u", "return import(/* @vite-ignore */ u)"))(url);

const scriptCache = new Map<string, Promise<void>>();
function loadScript(src: string): Promise<void> {
  if (scriptCache.has(src)) return scriptCache.get(src)!;
  const p = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
  scriptCache.set(src, p);
  return p;
}

const runtimeCache = new Map<string, Promise<unknown>>();
function once<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!runtimeCache.has(key)) runtimeCache.set(key, fn());
  return runtimeCache.get(key) as Promise<T>;
}

// -------- JavaScript --------

export async function runJs(code: string): Promise<RunResult> {
  const res = emptyResult();
  const start = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  const patchedConsole = {
    log: (...a: unknown[]) => stdout.push(a.map(fmt).join(" ")),
    info: (...a: unknown[]) => stdout.push(a.map(fmt).join(" ")),
    warn: (...a: unknown[]) => stderr.push(a.map(fmt).join(" ")),
    error: (...a: unknown[]) => stderr.push(a.map(fmt).join(" ")),
    debug: (...a: unknown[]) => stdout.push(a.map(fmt).join(" ")),
  };
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("console", `"use strict"; return (async () => { ${code}\n })();`);
    await fn(patchedConsole);
    res.ok = true;
  } catch (e) {
    res.ok = false;
    stderr.push(formatError(e));
  }
  res.stdout = stdout.join("\n");
  res.stderr = stderr.join("\n");
  res.durationMs = performance.now() - start;
  return res;
}

function fmt(v: unknown): string {
  if (typeof v === "string") return v;
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}

function formatError(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  return String(e);
}

// -------- TypeScript (transpile → JS) --------

export async function runTs(code: string): Promise<RunResult> {
  const ts = await once<any>("typescript", async () => {
    const mod = await cdnImport("https://esm.sh/typescript@5.6.3");
    return mod.default ?? mod;
  });
  const diagnostics: Diagnostic[] = [];
  const out = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      strict: false,
      esModuleInterop: true,
      // Intentionally omit `jsx` — leaving it unset avoids
      // `Argument for '--jsx' option must be: ...` on some TS builds.
    },
    reportDiagnostics: true,
  });
  for (const d of out.diagnostics ?? []) {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    let line: number | undefined, column: number | undefined;
    if (d.file && d.start != null) {
      const pos = d.file.getLineAndCharacterOfPosition(d.start);
      line = pos.line + 1;
      column = pos.character + 1;
    }
    diagnostics.push({
      severity: d.category === 1 ? "error" : d.category === 0 ? "warning" : "info",
      message: msg, line, column, source: "tsc",
    });
  }
  const result = await runJs(out.outputText);
  result.diagnostics.push(...diagnostics);
  return result;
}

// -------- Python (Pyodide) --------

export async function runPython(code: string): Promise<RunResult> {
  const pyodide = await once<any>("pyodide", async () => {
    await loadScript("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
    // @ts-expect-error injected by pyodide.js
    return await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/" });
  });
  const res = emptyResult();
  const start = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  pyodide.setStdout({ batched: (s: string) => stdout.push(s) });
  pyodide.setStderr({ batched: (s: string) => stderr.push(s) });
  try {
    await pyodide.runPythonAsync(code);
    res.ok = true;
  } catch (e) {
    res.ok = false;
    stderr.push(formatError(e));
  }
  res.stdout = stdout.join("\n");
  res.stderr = stderr.join("\n");
  res.durationMs = performance.now() - start;
  return res;
}

// -------- Lua (wasmoon) --------

export async function runLua(code: string): Promise<RunResult> {
  const factory = await once<any>("lua", async () => {
    const mod = await cdnImport("https://esm.sh/wasmoon@1.16.0");
    const f = new mod.LuaFactory();
    return f;
  });
  const res = emptyResult();
  const start = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  const lua = await factory.createEngine();
  lua.global.set("print", (...a: unknown[]) => stdout.push(a.map(fmt).join("\t")));
  try {
    await lua.doString(code);
    res.ok = true;
  } catch (e) {
    res.ok = false;
    stderr.push(formatError(e));
  } finally {
    lua.global.close();
  }
  res.stdout = stdout.join("\n");
  res.stderr = stderr.join("\n");
  res.durationMs = performance.now() - start;
  return res;
}

// -------- SQL (sql.js — SQLite) --------

export async function runSql(code: string): Promise<RunResult> {
  const SQL = await once<any>("sql", async () => {
    const mod = await cdnImport("https://esm.sh/sql.js@1.11.0");
    const initSqlJs = (mod.default ?? mod);
    return await initSqlJs({ locateFile: (f: string) => `https://esm.sh/sql.js@1.11.0/dist/${f}` });
  });
  const res = emptyResult();
  const start = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  try {
    const db = new SQL.Database();
    const results = db.exec(code);
    for (const r of results) {
      stdout.push(formatSqlTable(r.columns, r.values));
      stdout.push("");
    }
    if (!results.length) stdout.push("(no rows returned)");
    db.close();
    res.ok = true;
  } catch (e) {
    res.ok = false;
    stderr.push(formatError(e));
  }
  res.stdout = stdout.join("\n");
  res.stderr = stderr.join("\n");
  res.durationMs = performance.now() - start;
  return res;
}

function formatSqlTable(cols: string[], rows: unknown[][]): string {
  const widths = cols.map((c, i) =>
    Math.max(c.length, ...rows.map((r) => String(r[i] ?? "").length))
  );
  const pad = (s: string, w: number) => s + " ".repeat(w - s.length);
  const header = cols.map((c, i) => pad(c, widths[i])).join(" | ");
  const sep = widths.map((w) => "-".repeat(w)).join("-+-");
  const body = rows.map((r) => r.map((v, i) => pad(String(v ?? ""), widths[i])).join(" | "));
  return [header, sep, ...body].join("\n");
}

// -------- Ruby (ruby.wasm) --------

export async function runRuby(code: string): Promise<RunResult> {
  const vm = await once<any>("ruby", async () => {
    const mod = await cdnImport("https://cdn.jsdelivr.net/npm/@ruby/3.3-wasm-wasi@2.7.1/dist/browser/+esm");
    const { DefaultRubyVM } = mod;
    const response = await fetch(
      "https://cdn.jsdelivr.net/npm/@ruby/3.3-wasm-wasi@2.7.1/dist/ruby+stdlib.wasm"
    );
    const wasm = await WebAssembly.compileStreaming(response);
    const { vm } = await DefaultRubyVM(wasm);
    return vm;
  });
  const res = emptyResult();
  const start = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  try {
    // Redirect $stdout/$stderr through a StringIO so we can capture output.
    vm.eval(`
      require "stringio"
      $__plint_out = StringIO.new
      $__plint_err = StringIO.new
      $stdout = $__plint_out
      $stderr = $__plint_err
    `);
    try {
      vm.eval(code);
      res.ok = true;
    } catch (e) {
      res.ok = false;
      stderr.push(formatError(e));
    }
    stdout.push(vm.eval(`$__plint_out.string`).toString());
    stderr.push(vm.eval(`$__plint_err.string`).toString());
  } catch (e) {
    res.ok = false;
    stderr.push(formatError(e));
  }
  res.stdout = stdout.filter(Boolean).join("\n").trimEnd();
  res.stderr = stderr.filter(Boolean).join("\n").trimEnd();
  res.durationMs = performance.now() - start;
  return res;
}

// -------- PHP (php-wasm) --------

export async function runPhp(code: string): Promise<RunResult> {
  const php = await once<any>("php", async () => {
    const mod = await cdnImport("https://esm.sh/php-wasm@0.0.9/PhpWeb.mjs");
    const { PhpWeb } = mod;
    const p = new PhpWeb();
    await p.binary;
    return p;
  });
  const res = emptyResult();
  const start = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  const onOut = (e: any) => stdout.push(e.detail);
  const onErr = (e: any) => stderr.push(e.detail);
  php.addEventListener("output", onOut);
  php.addEventListener("error", onErr);
  try {
    const exit = await php.run(code);
    res.ok = exit === 0;
  } catch (e) {
    res.ok = false;
    stderr.push(formatError(e));
  } finally {
    php.removeEventListener("output", onOut);
    php.removeEventListener("error", onErr);
  }
  res.stdout = stdout.join("");
  res.stderr = stderr.join("");
  res.durationMs = performance.now() - start;
  return res;
}

// -------- HTML (live preview in an iframe) --------

export async function runHtml(code: string): Promise<RunResult> {
  const res = emptyResult();
  res.html = code;
  res.stdout = "(rendered preview above)";
  res.ok = true;
  res.durationMs = 0;
  return res;
}

// -------- Brainfuck (30k-cell tape, in-browser) --------

export async function runBrainfuck(code: string): Promise<RunResult> {
  const res = emptyResult();
  const start = performance.now();
  const out: string[] = [];
  try {
    const tape = new Uint8Array(30000);
    let ptr = 0, pc = 0;
    // Pre-compute jump table for [ and ].
    const jumps = new Map<number, number>();
    const stack: number[] = [];
    for (let i = 0; i < code.length; i++) {
      if (code[i] === "[") stack.push(i);
      else if (code[i] === "]") {
        const s = stack.pop();
        if (s == null) throw new Error("Unmatched ] at position " + i);
        jumps.set(s, i); jumps.set(i, s);
      }
    }
    if (stack.length) throw new Error("Unmatched [ at position " + stack[0]);

    const MAX_STEPS = 5_000_000;
    let steps = 0;
    while (pc < code.length) {
      if (++steps > MAX_STEPS) throw new Error("Execution limit reached (" + MAX_STEPS + " steps)");
      const c = code[pc];
      switch (c) {
        case ">": ptr = (ptr + 1) % 30000; break;
        case "<": ptr = (ptr - 1 + 30000) % 30000; break;
        case "+": tape[ptr] = (tape[ptr] + 1) & 0xff; break;
        case "-": tape[ptr] = (tape[ptr] - 1) & 0xff; break;
        case ".": out.push(String.fromCharCode(tape[ptr])); break;
        case ",": tape[ptr] = 0; break; // no stdin
        case "[": if (tape[ptr] === 0) pc = jumps.get(pc)!; break;
        case "]": if (tape[ptr] !== 0) pc = jumps.get(pc)!; break;
      }
      pc++;
    }
    res.stdout = out.join("");
    res.ok = true;
  } catch (e) {
    res.ok = false;
    res.stderr = formatError(e);
  }
  res.durationMs = performance.now() - start;
  return res;
}
