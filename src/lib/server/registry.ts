import { hasBinary, run, withWorkspace } from "./sandbox";
import { runAsmVM } from "./asmvm";
import { runNative } from "./native";
import {
  runDeadfish, runOok, runWhitespace, runBefunge, runBinary, runChicken,
  runLolcode, runShakespeare, runIntercal, runChef, runArnoldC, runRockstar,
  pietMessage, malbolgeMessage,
} from "./esoteric";

export interface ServerRunResult {
  stdout: string;
  stderr: string;
  ok: boolean;
}

const ESOTERIC_HANDLERS: Record<string, (code: string) => ServerRunResult> = {
  deadfish: runDeadfish,
  ook: (c) => runOok(c),
  whitespace: (c) => runWhitespace(c),
  befunge: (c) => runBefunge(c),
  binary: runBinary,
  chicken: runChicken,
  lolcode: runLolcode,
  shakespeare: runShakespeare,
  intercal: runIntercal,
  chef: runChef,
  arnoldc: runArnoldC,
  rockstar: runRockstar,
  piet: () => pietMessage(),
  malbolge: () => malbolgeMessage("malbolge"),
  "malbolge-u": () => malbolgeMessage("malbolge-u"),
};

// -------------------- WAT (WebAssembly Text) --------------------
async function runWat(code: string): Promise<ServerRunResult> {
  if (!(await hasBinary("wat2wasm"))) {
    return { stdout: "", stderr: "wat2wasm not found. Install: apt install wabt", ok: false };
  }
  return withWorkspace("main.wat", code, async (dir) => {
    const build = await run("wat2wasm", ["main.wat", "-o", "main.wasm"], { cwd: dir, timeoutMs: 10_000 });
    if (build.code !== 0) return { stdout: "", stderr: build.stderr || "wat2wasm failed.", ok: false };
    try {
      const { readFile } = await import("node:fs/promises");
      const path = await import("node:path");
      const bytes = await readFile(path.join(dir, "main.wasm"));
      const mod = await WebAssembly.instantiate(bytes, {});
      const exportNames = Object.keys(mod.instance.exports);
      const zeroArgFn = exportNames.find((n) => typeof mod.instance.exports[n] === "function");
      let out = `Compiled successfully. Exports: ${exportNames.join(", ") || "(none)"}\n`;
      if (zeroArgFn) {
        try {
          const fn = mod.instance.exports[zeroArgFn] as (...a: number[]) => number;
          const result = fn(1, 1); // harmless args for common 2-arity demo functions
          out += `${zeroArgFn}(1, 1) = ${result}\n`;
        } catch {
          // export isn't callable with these args, compile result still stands
        }
      }
      return { stdout: out, stderr: "", ok: true };
    } catch (e) {
      return { stdout: "", stderr: `Compiled, but couldn't instantiate: ${String(e)}`, ok: false };
    }
  });
}

// -------------------- LLVM IR --------------------
async function runLlvmIr(code: string): Promise<ServerRunResult> {
  if (!(await hasBinary("lli"))) {
    return { stdout: "", stderr: "lli not found. Install: apt install llvm (fairly large, optional tier, see docs/DEPLOY.md)", ok: false };
  }
  return withWorkspace("main.ll", code, async (dir) => {
    const res = await run("lli", ["main.ll"], { cwd: dir, timeoutMs: 10_000 });
    return { stdout: res.stdout, stderr: res.stderr, ok: res.code === 0 && !res.timedOut };
  });
}

// -------------------- Jasmin (JVM assembly) --------------------
async function runJasmin(code: string): Promise<ServerRunResult> {
  const jar = process.env.JASMIN_JAR;
  if (!jar || !(await hasBinary("java"))) {
    return {
      stdout: "",
      stderr: "Jasmin needs a JDK plus jasmin.jar. Set JASMIN_JAR=/path/to/jasmin.jar in your .env " +
        "(download from https://github.com/davidar/jasmin/releases) and install a JDK: apt install default-jdk",
      ok: false,
    };
  }
  const classMatch = code.match(/\.class\s+(?:public\s+|final\s+)*(\S+)/);
  const className = classMatch ? classMatch[1] : "Main";
  return withWorkspace(`${className}.j`, code, async (dir) => {
    const build = await run("java", ["-jar", jar, `${className}.j`], { cwd: dir, timeoutMs: 15_000 });
    if (build.code !== 0) return { stdout: build.stdout, stderr: build.stderr || "Jasmin assembly failed.", ok: false };
    const res = await run("java", ["-cp", ".", className], { cwd: dir, timeoutMs: 10_000 });
    return { stdout: res.stdout, stderr: res.stderr, ok: res.code === 0 && !res.timedOut };
  });
}

// -------------------- CIL / MSIL --------------------
async function runCil(code: string): Promise<ServerRunResult> {
  if (!(await hasBinary("ilasm"))) {
    return { stdout: "", stderr: "ilasm not found. Install: apt install mono-devel", ok: false };
  }
  return withWorkspace("main.il", code, async (dir) => {
    const build = await run("ilasm", ["main.il", "-output=main.exe"], { cwd: dir, timeoutMs: 15_000 });
    if (build.code !== 0) return { stdout: build.stdout, stderr: build.stderr || "ilasm failed.", ok: false };
    const res = await run("mono", ["main.exe"], { cwd: dir, timeoutMs: 10_000 });
    return { stdout: res.stdout, stderr: res.stderr, ok: res.code === 0 && !res.timedOut };
  });
}

const SPECIAL_BYTECODE: Record<string, (code: string) => Promise<ServerRunResult>> = {
  wat: runWat,
  llvm: runLlvmIr,
  jasmin: runJasmin,
  cil: runCil,
};

export async function executeOnServer(serverId: string, code: string): Promise<ServerRunResult> {
  if (serverId.startsWith("asm-")) return runAsmVM(code);
  if (serverId in SPECIAL_BYTECODE) return SPECIAL_BYTECODE[serverId](code);
  if (serverId in ESOTERIC_HANDLERS) {
    try {
      return ESOTERIC_HANDLERS[serverId](code);
    } catch (e) {
      return { stdout: "", stderr: `Interpreter error: ${String(e)}`, ok: false };
    }
  }
  return runNative(serverId, code);
}
