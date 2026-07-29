// Dispatches "server" runtime languages to real, installed system
// interpreters/compilers. See docs/ARCHITECTURE.md and
// scripts/install-interpreters.sh.
//
// Nothing here is bundled or auto-installed: if a binary isn't on PATH,
// the response says what to install instead of failing silently.

import { hasBinary, run, withWorkspace, type ExecOutcome } from "./sandbox";

export interface NativeResult {
  stdout: string;
  stderr: string;
  ok: boolean;
}

interface BuildStep {
  cmd: string;
  args: string[];
}

interface NativeSpec {
  checkBin: string;
  installHint: string;
  filename: string;
  build?: (dir: string) => BuildStep;
  runCmd: (dir: string) => BuildStep;
  timeoutMs?: number;
}

// Languages that need a toolchain too heavy/unreliable for a small,
// shared personal server to install by default, or that fundamentally
// don't have a meaningful headless-stdout execution model.
const GRACEFUL: Record<string, string> = {
  actionscript:
    "No lightweight, actively-maintained open-source ActionScript 3 runtime exists for headless " +
    "execution. If you need it, look at Apache Royale or Ruffle and wire a custom runner in " +
    "src/lib/server/native.ts.",
  batch:
    "Windows Batch has no native Linux runtime. Running it here would mean installing Wine just for " +
    ".bat files - install Wine and add a runner in src/lib/server/native.ts if you need this.",
  elm:
    "Elm targets the browser (DOM/ports), not headless stdout - there's no meaningful 'print and exit' " +
    "story for it. Use `elm reactor` locally to run Elm programs interactively.",
  mojo:
    "Mojo's toolchain (via the Modular CLI) is a multi-GB install, which is a lot for a small personal " +
    "server. Install it manually (https://www.modular.com/mojo) and PLInt will use `mojo` automatically " +
    "once it's on PATH.",
  objc:
    "Objective-C on Linux needs the GNUstep runtime, which is a heavy, somewhat fragile install for a " +
    "small server. Install gnustep-base-runtime + gobjc if you want this enabled, then add a runner in " +
    "src/lib/server/native.ts.",
  objcpp:
    "Objective-C++ has the same GNUstep dependency as Objective-C - see that message.",
  smali:
    "Smali/Dalvik execution needs Android build tooling (dx/d8 + an ART or Dalvik runtime), which is " +
    "too heavy for a general-purpose personal server. Not enabled by default.",
  svelte:
    "Svelte components compile to DOM-mutation code - they need a browser (or jsdom) to actually run, " +
    "not a plain Node process. Not a good fit for headless 'run and print stdout'.",
};

function classNameFromJava(code: string): string {
  const m = code.match(/public\s+(?:final\s+)?class\s+(\w+)/);
  return m ? m[1] : "Main";
}
function classNameFromHaxe(code: string): string {
  const m = code.match(/class\s+(\w+)/);
  return m ? m[1] : "Main";
}

const SPECS: Record<string, NativeSpec> = {
  perl: { checkBin: "perl", installHint: "apt install perl", filename: "main.pl", runCmd: () => ({ cmd: "perl", args: ["main.pl"] }) },
  r: { checkBin: "Rscript", installHint: "apt install r-base-core", filename: "main.R", runCmd: () => ({ cmd: "Rscript", args: ["main.R"] }) },
  matlab: { checkBin: "octave-cli", installHint: "apt install octave", filename: "main.m", runCmd: () => ({ cmd: "octave-cli", args: ["--quiet", "--no-window-system", "main.m"] }) },
  julia: { checkBin: "julia", installHint: "install from julialang.org (not in default apt repos)", filename: "main.jl", runCmd: () => ({ cmd: "julia", args: ["main.jl"] }) },
  elixir: { checkBin: "elixir", installHint: "apt install elixir", filename: "main.exs", runCmd: () => ({ cmd: "elixir", args: ["main.exs"] }) },
  erlang: { checkBin: "escript", installHint: "apt install erlang", filename: "main.erl", runCmd: () => ({ cmd: "escript", args: ["main.erl"] }) },
  clojure: { checkBin: "clojure", installHint: "apt install clojure (needs a JDK too)", filename: "main.clj", runCmd: () => ({ cmd: "clojure", args: ["-M", "main.clj"] }) },
  awk: { checkBin: "awk", installHint: "apt install gawk", filename: "main.awk", runCmd: () => ({ cmd: "awk", args: ["-f", "main.awk"] }) },
  clisp: { checkBin: "clisp", installHint: "apt install clisp", filename: "main.lisp", runCmd: () => ({ cmd: "clisp", args: ["main.lisp"] }) },
  cmake: { checkBin: "cmake", installHint: "apt install cmake", filename: "main.cmake", runCmd: () => ({ cmd: "cmake", args: ["-P", "main.cmake"] }) },
  makefile: { checkBin: "make", installHint: "apt install make", filename: "Makefile", runCmd: () => ({ cmd: "make", args: ["-f", "Makefile"] }) },
  bash: { checkBin: "bash", installHint: "preinstalled on virtually every Linux distro", filename: "main.sh", runCmd: () => ({ cmd: "bash", args: ["main.sh"] }) },
  powershell: { checkBin: "pwsh", installHint: "apt install powershell (via Microsoft's apt repo)", filename: "main.ps1", runCmd: () => ({ cmd: "pwsh", args: ["-NoLogo", "-NonInteractive", "-File", "main.ps1"] }) },
  smalltalk: { checkBin: "gst", installHint: "apt install gnu-smalltalk", filename: "main.st", runCmd: () => ({ cmd: "gst", args: ["main.st"] }) },
  groovy: { checkBin: "groovy", installHint: "apt install groovy (needs a JDK too)", filename: "main.groovy", runCmd: () => ({ cmd: "groovy", args: ["main.groovy"] }) },
  scala: { checkBin: "scala", installHint: "install via coursier/sdkman (needs a JDK)", filename: "main.scala", runCmd: () => ({ cmd: "scala", args: ["main.scala"] }) },
  fsharp: { checkBin: "dotnet", installHint: "apt install dotnet-sdk-8.0", filename: "main.fsx", runCmd: () => ({ cmd: "dotnet", args: ["fsi", "main.fsx"] }) },
  ocaml: { checkBin: "ocaml", installHint: "apt install ocaml", filename: "main.ml", runCmd: () => ({ cmd: "ocaml", args: ["main.ml"] }) },
  haskell: { checkBin: "runghc", installHint: "apt install ghc", filename: "main.hs", runCmd: () => ({ cmd: "runghc", args: ["main.hs"] }) },
  nix: { checkBin: "nix-instantiate", installHint: "apt install nix-bin", filename: "main.nix", runCmd: () => ({ cmd: "nix-instantiate", args: ["--eval", "main.nix"] }) },
  swift: { checkBin: "swift", installHint: "install from swift.org (not in default apt repos)", filename: "main.swift", runCmd: () => ({ cmd: "swift", args: ["main.swift"] }) },
  dart: { checkBin: "dart", installHint: "install from dart.dev (not in default apt repos)", filename: "main.dart", runCmd: () => ({ cmd: "dart", args: ["run", "main.dart"] }) },
  go: { checkBin: "go", installHint: "apt install golang-go", filename: "main.go", runCmd: () => ({ cmd: "go", args: ["run", "main.go"] }) },
  crystal: { checkBin: "crystal", installHint: "install from crystal-lang.org (not in default apt repos)", filename: "main.cr", runCmd: () => ({ cmd: "crystal", args: ["run", "main.cr"] }) },
  v: { checkBin: "v", installHint: "install from vlang.io (not in default apt repos)", filename: "main.v", runCmd: () => ({ cmd: "v", args: ["run", "main.v"] }) },
  zig: { checkBin: "zig", installHint: "install from ziglang.org (not in default apt repos)", filename: "main.zig", runCmd: () => ({ cmd: "zig", args: ["run", "main.zig"] }) },
  d: { checkBin: "rdmd", installHint: "apt install ldc (provides rdmd)", filename: "main.d", runCmd: () => ({ cmd: "rdmd", args: ["main.d"] }) },
  nim: { checkBin: "nim", installHint: "apt install nim", filename: "main.nim", runCmd: () => ({ cmd: "nim", args: ["r", "--hints:off", "main.nim"] }), timeoutMs: 20_000 },
  solidity: { checkBin: "solc", installHint: "apt install solc", filename: "main.sol", runCmd: () => ({ cmd: "solc", args: ["--bin", "main.sol"] }) },

  c: { checkBin: "gcc", installHint: "apt install gcc", filename: "main.c", build: () => ({ cmd: "gcc", args: ["main.c", "-O1", "-o", "a.out"] }), runCmd: () => ({ cmd: "./a.out", args: [] }) },
  cpp: { checkBin: "g++", installHint: "apt install g++", filename: "main.cpp", build: () => ({ cmd: "g++", args: ["main.cpp", "-O1", "-o", "a.out"] }), runCmd: () => ({ cmd: "./a.out", args: [] }) },
  rust: { checkBin: "rustc", installHint: "install via rustup.rs", filename: "main.rs", build: () => ({ cmd: "rustc", args: ["main.rs", "-O", "-o", "a.out"] }), runCmd: () => ({ cmd: "./a.out", args: [] }), timeoutMs: 20_000 },
  fortran: { checkBin: "gfortran", installHint: "apt install gfortran", filename: "main.f90", build: () => ({ cmd: "gfortran", args: ["main.f90", "-o", "a.out"] }), runCmd: () => ({ cmd: "./a.out", args: [] }) },
  cobol: { checkBin: "cobc", installHint: "apt install gnucobol4 (or gnucobol)", filename: "main.cob", build: () => ({ cmd: "cobc", args: ["-x", "main.cob", "-o", "a.out"] }), runCmd: () => ({ cmd: "./a.out", args: [] }) },
  ada: { checkBin: "gnatmake", installHint: "apt install gnat", filename: "main.adb", build: () => ({ cmd: "gnatmake", args: ["-q", "main.adb", "-o", "a.out"] }), runCmd: () => ({ cmd: "./a.out", args: [] }) },
  pascal: { checkBin: "fpc", installHint: "apt install fpc", filename: "main.pas", build: () => ({ cmd: "fpc", args: ["-oa.out", "main.pas"] }), runCmd: () => ({ cmd: "./a.out", args: [] }) },
  csharp: { checkBin: "mcs", installHint: "apt install mono-mcs mono-runtime", filename: "main.cs", build: () => ({ cmd: "mcs", args: ["main.cs", "-out:a.exe"] }), runCmd: () => ({ cmd: "mono", args: ["a.exe"] }) },
  kotlin: { checkBin: "kotlinc", installHint: "install via sdkman (needs a JDK)", filename: "main.kt", build: () => ({ cmd: "kotlinc", args: ["main.kt", "-include-runtime", "-d", "a.jar"] }), runCmd: () => ({ cmd: "java", args: ["-jar", "a.jar"] }), timeoutMs: 30_000 },
};

async function runSpec(spec: NativeSpec, code: string, timeoutMs?: number): Promise<NativeResult> {
  return withWorkspace(spec.filename, code, async (dir) => {
    if (spec.build) {
      const b = spec.build(dir);
      const buildRes = await run(b.cmd, b.args, { cwd: dir, timeoutMs: 20_000 });
      if (buildRes.code !== 0) {
        return { stdout: buildRes.stdout, stderr: buildRes.stderr || "Build failed.", ok: false };
      }
    }
    const r = spec.runCmd(dir);
    const res: ExecOutcome = await run(r.cmd, r.args, { cwd: dir, timeoutMs: timeoutMs ?? spec.timeoutMs });
    return { stdout: res.stdout, stderr: res.stderr, ok: res.code === 0 && !res.timedOut };
  });
}

async function runJava(code: string): Promise<NativeResult> {
  if (!(await hasBinary("javac"))) {
    return { stdout: "", stderr: "javac not found. Install: apt install default-jdk", ok: false };
  }
  const className = classNameFromJava(code);
  return withWorkspace(`${className}.java`, code, async (dir) => {
    const build = await run("javac", [`${className}.java`], { cwd: dir, timeoutMs: 20_000 });
    if (build.code !== 0) return { stdout: build.stdout, stderr: build.stderr || "Build failed.", ok: false };
    const res = await run("java", ["-cp", ".", className], { cwd: dir, timeoutMs: 10_000 });
    return { stdout: res.stdout, stderr: res.stderr, ok: res.code === 0 && !res.timedOut };
  });
}

async function runHaxe(code: string): Promise<NativeResult> {
  if (!(await hasBinary("haxe"))) {
    return { stdout: "", stderr: "haxe not found. Install: apt install haxe", ok: false };
  }
  const className = classNameFromHaxe(code);
  return withWorkspace(`${className}.hx`, code, async (dir) => {
    const res = await run("haxe", ["--run", className], { cwd: dir, timeoutMs: 15_000 });
    return { stdout: res.stdout, stderr: res.stderr, ok: res.code === 0 && !res.timedOut };
  });
}

async function runGleam(code: string): Promise<NativeResult> {
  if (!(await hasBinary("gleam"))) {
    return { stdout: "", stderr: "gleam not found. Install: see gleam.run/getting-started", ok: false };
  }
  return withWorkspace(
    "gleam.toml",
    `name = "plint_tmp"\nversion = "1.0.0"\n\n[dependencies]\ngleam_stdlib = ">= 0.34.0 and < 2.0.0"\n`,
    async (dir) => {
      const { mkdir, writeFile } = await import("node:fs/promises");
      const path = await import("node:path");
      await mkdir(path.join(dir, "src"), { recursive: true });
      await writeFile(path.join(dir, "src", "plint_tmp.gleam"), code, "utf8");
      const res = await run("gleam", ["run"], { cwd: dir, timeoutMs: 25_000 });
      return { stdout: res.stdout, stderr: res.stderr, ok: res.code === 0 && !res.timedOut };
    }
  );
}

export async function runNative(serverId: string, code: string): Promise<NativeResult> {
  if (serverId in GRACEFUL) return { stdout: "", stderr: GRACEFUL[serverId], ok: false };
  if (serverId === "java") return runJava(code);
  if (serverId === "haxe") return runHaxe(code);
  if (serverId === "gleam") return runGleam(code);

  const spec = SPECS[serverId];
  if (!spec) {
    return { stdout: "", stderr: `No execution backend configured for "${serverId}" yet.`, ok: false };
  }
  if (!(await hasBinary(spec.checkBin))) {
    return { stdout: "", stderr: `${spec.checkBin} not found on this server. Install: ${spec.installHint}`, ok: false };
  }
  return runSpec(spec, code);
}
