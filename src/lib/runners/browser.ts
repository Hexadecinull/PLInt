// Browser-side runners. Runtimes are lazy-loaded from CDNs the first time
// each language is used so the initial bundle stays small.

import type { RunResult, Diagnostic } from "./types";
import { emptyResult } from "./types";

// -------- shared loader helpers --------

// Dynamic-import URLs via a variable so TypeScript's module resolver doesn't
// try to resolve remote URLs at build time.
const cdnImport = (url: string): Promise<Record<string, unknown>> =>
  new Function("u", "return import(/* @vite-ignore */ u)")(url);

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
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function formatError(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  return String(e);
}

// -------- TypeScript (transpile to JS) --------

interface TsDiagnostic {
  category: number;
  messageText: unknown;
  file?: { getLineAndCharacterOfPosition: (pos: number) => { line: number; character: number } };
  start?: number;
}
interface TsModule {
  transpileModule: (
    code: string,
    opts: unknown
  ) => { outputText: string; diagnostics?: TsDiagnostic[] };
  ScriptTarget: Record<string, unknown>;
  ModuleKind: Record<string, unknown>;
  flattenDiagnosticMessageText: (msg: unknown, sep: string) => string;
}

export async function runTs(code: string): Promise<RunResult> {
  const ts = await once<TsModule>("typescript", async () => {
    const mod = await cdnImport("https://esm.sh/typescript@5.6.3");
    return (mod.default ?? mod) as TsModule;
  });
  const diagnostics: Diagnostic[] = [];
  const out = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      strict: false,
      esModuleInterop: true,
      // jsx is intentionally left unset, some TS builds reject the option.
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
      message: msg,
      line,
      column,
      source: "tsc",
    });
  }
  const result = await runJs(out.outputText);
  result.diagnostics.push(...diagnostics);
  return result;
}

// -------- Python (Pyodide) --------

interface PyodideInterface {
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  runPythonAsync: (code: string) => Promise<unknown>;
}

export async function runPython(code: string): Promise<RunResult> {
  const pyodide = await once<PyodideInterface>("pyodide", async () => {
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

interface LuaEngine {
  global: { set: (name: string, fn: (...a: unknown[]) => void) => void; close: () => void };
  doString: (code: string) => Promise<unknown>;
}
interface LuaFactory {
  createEngine: () => Promise<LuaEngine>;
}

export async function runLua(code: string): Promise<RunResult> {
  const factory = await once<LuaFactory>("lua", async () => {
    const mod = await cdnImport("https://esm.sh/wasmoon@1.16.0");
    const Ctor = mod.LuaFactory as new () => LuaFactory;
    return new Ctor();
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

// -------- SQL (sql.js, SQLite compiled to WASM) --------

interface SqlJsDatabase {
  exec: (sql: string) => { columns: string[]; values: unknown[][] }[];
  close: () => void;
}
interface SqlJsStatic {
  Database: new () => SqlJsDatabase;
}

export async function runSql(code: string): Promise<RunResult> {
  const SQL = await once<SqlJsStatic>("sql", async () => {
    const mod = await cdnImport("https://esm.sh/sql.js@1.11.0");
    const initSqlJs = (mod.default ?? mod) as (opts: unknown) => Promise<SqlJsStatic>;
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

interface RubyValue {
  toString: () => string;
}
interface RubyVM {
  eval: (code: string) => RubyValue;
}

export async function runRuby(code: string): Promise<RunResult> {
  const vm = await once<RubyVM>("ruby", async () => {
    const mod = await cdnImport(
      "https://cdn.jsdelivr.net/npm/@ruby/3.3-wasm-wasi@2.7.1/dist/browser/+esm"
    );
    const DefaultRubyVM = mod.DefaultRubyVM as (
      wasm: WebAssembly.Module
    ) => Promise<{ vm: RubyVM }>;
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
    // Redirect $stdout/$stderr through a StringIO to capture output.
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

interface PhpWebInstance {
  binary: Promise<unknown>;
  addEventListener: (type: string, listener: (e: CustomEvent<string>) => void) => void;
  removeEventListener: (type: string, listener: (e: CustomEvent<string>) => void) => void;
  run: (code: string) => Promise<number>;
}

export async function runPhp(code: string): Promise<RunResult> {
  const php = await once<PhpWebInstance>("php", async () => {
    const mod = await cdnImport("https://esm.sh/php-wasm@0.0.9/PhpWeb.mjs");
    const Ctor = mod.PhpWeb as new () => PhpWebInstance;
    const p = new Ctor();
    await p.binary;
    return p;
  });
  const res = emptyResult();
  const start = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];
  const onOut = (e: CustomEvent<string>) => stdout.push(e.detail);
  const onErr = (e: CustomEvent<string>) => stderr.push(e.detail);
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

// -------- CoffeeScript (compile to JS, then run like JS) --------

interface CoffeeScriptModule {
  compile: (code: string, opts: { bare: boolean }) => string;
}

export async function runCoffeeScript(code: string): Promise<RunResult> {
  const start = performance.now();
  const coffee = await once<CoffeeScriptModule>("coffeescript", async () => {
    const mod = await cdnImport("https://esm.sh/coffeescript@2.7.0");
    return (mod.default ?? mod) as CoffeeScriptModule;
  });
  try {
    const js = coffee.compile(code, { bare: true });
    const result = await runJs(js);
    result.durationMs = performance.now() - start;
    return result;
  } catch (e) {
    const res = emptyResult();
    res.ok = false;
    res.stderr = formatError(e);
    res.durationMs = performance.now() - start;
    return res;
  }
}

// -------- Markdown (sanitized live HTML preview, same pathway as HTML) --------

interface MarkedFn {
  parse: (src: string, opts: unknown) => string | Promise<string>;
}
interface DomPurifyLike {
  sanitize: (html: string) => string;
}

export async function runMarkdown(code: string): Promise<RunResult> {
  const res = emptyResult();
  const start = performance.now();
  try {
    const [markedMod, dompurifyMod] = await Promise.all([
      once<Record<string, unknown>>("marked", () => cdnImport("https://esm.sh/marked@13.0.3")),
      once<Record<string, unknown>>("dompurify", () => cdnImport("https://esm.sh/dompurify@3.1.6")),
    ]);
    const marked = (markedMod.marked ?? markedMod.default ?? markedMod) as MarkedFn;
    const DOMPurify = (dompurifyMod.default ?? dompurifyMod) as DomPurifyLike;
    const rawHtml = await marked.parse(code, { breaks: true, gfm: true });
    res.html = DOMPurify.sanitize(rawHtml);
    res.stdout = "(rendered preview above)";
    res.ok = true;
  } catch (e) {
    res.ok = false;
    res.stderr = formatError(e);
  }
  res.durationMs = performance.now() - start;
  return res;
}

// -------- Brainfuck (30k-cell tape, in-browser) --------

export async function runBrainfuck(code: string): Promise<RunResult> {
  const res = emptyResult();
  const start = performance.now();
  const out: string[] = [];
  try {
    const tape = new Uint8Array(30000);
    let ptr = 0,
      pc = 0;
    // Pre-compute jump table for [ and ].
    const jumps = new Map<number, number>();
    const stack: number[] = [];
    for (let i = 0; i < code.length; i++) {
      if (code[i] === "[") stack.push(i);
      else if (code[i] === "]") {
        const s = stack.pop();
        if (s == null) throw new Error("Unmatched ] at position " + i);
        jumps.set(s, i);
        jumps.set(i, s);
      }
    }
    if (stack.length) throw new Error("Unmatched [ at position " + stack[0]);

    const MAX_STEPS = 5_000_000;
    let steps = 0;
    while (pc < code.length) {
      if (++steps > MAX_STEPS) throw new Error("Execution limit reached (" + MAX_STEPS + " steps)");
      const c = code[pc];
      switch (c) {
        case ">":
          ptr = (ptr + 1) % 30000;
          break;
        case "<":
          ptr = (ptr - 1 + 30000) % 30000;
          break;
        case "+":
          tape[ptr] = (tape[ptr] + 1) & 0xff;
          break;
        case "-":
          tape[ptr] = (tape[ptr] - 1) & 0xff;
          break;
        case ".":
          out.push(String.fromCharCode(tape[ptr]));
          break;
        case ",":
          tape[ptr] = 0; // no stdin
          break;
        case "[":
          if (tape[ptr] === 0) pc = jumps.get(pc)!;
          break;
        case "]":
          if (tape[ptr] !== 0) pc = jumps.get(pc)!;
          break;
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
