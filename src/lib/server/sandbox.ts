import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export interface ExecOptions {
  cwd: string;
  timeoutMs?: number;
  memoryMB?: number;
  stdin?: string;
  env?: Record<string, string>;
}

export interface ExecOutcome {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;
}

const MAX_OUTPUT = 200_000; // characters, per stream — keeps runaway output cheap to buffer
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MEMORY_MB = 256;

/**
 * Runs `cmd args...` inside `opts.cwd`, wrapped with `nice` (lower CPU
 * priority — this box is a decade-old laptop, not a build server) and a
 * `ulimit -v` memory ceiling. Always resolves; failures show up as a
 * non-zero exit code plus stderr rather than a thrown rejection, so callers
 * don't need a second error-handling path on top of the exit-code check.
 */
export function run(cmd: string, args: string[], opts: ExecOptions): Promise<ExecOutcome> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const memoryKB = (opts.memoryMB ?? DEFAULT_MEMORY_MB) * 1024;

  // Quoting is safe here because every argument we ever pass through this
  // path is a path we generated ourselves inside a fresh temp directory
  // (alphanumeric + a fixed prefix) — never raw user text.
  const quoted = [cmd, ...args].map((a) => `'${a.replace(/'/g, `'\\''`)}'`).join(" ");
  const shCmd = `ulimit -v ${memoryKB} 2>/dev/null; exec ${quoted}`;

  return new Promise((resolve) => {
    const child = spawn("nice", ["-n", "15", "bash", "-c", shCmd], {
      cwd: opts.cwd,
      env: { ...process.env, ...opts.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const killTimer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (d) => {
      if (stdout.length < MAX_OUTPUT) stdout += d.toString("utf8");
    });
    child.stderr.on("data", (d) => {
      if (stderr.length < MAX_OUTPUT) stderr += d.toString("utf8");
    });

    if (opts.stdin) {
      child.stdin.write(opts.stdin);
    }
    child.stdin.end();

    child.on("error", (e) => {
      clearTimeout(killTimer);
      resolve({ stdout, stderr: stderr || String(e), code: null, signal: null, timedOut });
    });

    child.on("close", (code, signal) => {
      clearTimeout(killTimer);
      resolve({
        stdout: stdout.slice(0, MAX_OUTPUT),
        stderr: (timedOut ? `Execution timed out after ${timeoutMs}ms.\n` : "") + stderr.slice(0, MAX_OUTPUT),
        code,
        signal,
        timedOut,
      });
    });
  });
}

/** Checks whether a binary is reachable on PATH, cached for the process lifetime. */
const binCache = new Map<string, Promise<boolean>>();
export function hasBinary(bin: string): Promise<boolean> {
  if (!binCache.has(bin)) {
    binCache.set(
      bin,
      new Promise((resolve) => {
        const child = spawn("bash", ["-lc", `command -v ${bin}`], { stdio: "ignore" });
        child.on("error", () => resolve(false));
        child.on("close", (code) => resolve(code === 0));
      })
    );
  }
  return binCache.get(bin)!;
}

/** Creates a fresh temp workspace, writes the source file, and cleans up after `fn` resolves. */
export async function withWorkspace<T>(
  filename: string,
  code: string,
  fn: (dir: string, filePath: string) => Promise<T>
): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), "plint-"));
  try {
    const filePath = path.join(dir, filename);
    await writeFile(filePath, code, "utf8");
    return await fn(dir, filePath);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function makeExecutable(filePath: string): Promise<void> {
  await chmod(filePath, 0o755).catch(() => {});
}
