// Language catalog for PLInt.

export type RuntimeKind =
  | "js"
  | "ts"
  | "python"
  | "lua"
  | "sql"
  | "ruby"
  | "php"
  | "html"
  | "brainfuck"
  | "server";

export type LanguageGroup = "core" | "weird" | "esoteric";

export interface LanguageDef {
  id: string;
  name: string;
  monaco: string;
  runtime: RuntimeKind;
  serverId?: string;
  ext: string;
  sample: string;
  group?: LanguageGroup;
  syntax: {
    comment: string;
    variable: string;
    fn: string;
    io: string;
    loop: string;
    conditional: string;
  };
}

// ---------------- samples ----------------

const py = `# Python 3 — PLInt
def greet(name: str) -> str:
    return f"Hello, {name}!"

for i in range(3):
    print(greet(f"world #{i}"))
`;

const rb = `# Ruby — PLInt
def greet(name) = "Hello, #{name}!"
3.times { |i| puts greet("world ##{i}") }
`;

const perl = `#!/usr/bin/perl
# Perl — PLInt
use strict; use warnings;
sub greet { my ($n) = @_; return "Hello, $n!"; }
for my $i (0..2) { print greet("world #$i"), "\\n"; }
`;

const lua = `-- Lua — PLInt
local function greet(name) return "Hello, " .. name .. "!" end
for i = 0, 2 do print(greet("world #" .. i)) end
`;

const r = `# R — PLInt
greet <- function(name) paste0("Hello, ", name, "!")
for (i in 0:2) cat(greet(paste0("world #", i)), "\\n")
`;

const php = `<?php
// PHP — PLInt
function greet($name) { return "Hello, $name!"; }
for ($i = 0; $i < 3; $i++) echo greet("world #$i") . "\\n";
`;

const js = `// JavaScript — PLInt
const greet = (name) => \`Hello, \${name}!\`;
for (let i = 0; i < 3; i++) console.log(greet(\`world #\${i}\`));
`;

const ts = `// TypeScript — PLInt
type User = { name: string; age: number };
const users: User[] = [
  { name: "Ada", age: 36 },
  { name: "Linus", age: 55 },
];
users.forEach((u) => console.log(\`\${u.name} is \${u.age}\`));
`;

const java = `// Java — PLInt
public class Main {
  public static void main(String[] args) {
    for (int i = 0; i < 3; i++) System.out.println("Hello #" + i);
  }
}
`;

const kt = `// Kotlin — PLInt
fun main() {
  (0 until 3).forEach { println("Hello #$it") }
}
`;

const cs = `// C# — PLInt
using System;
class Program {
  static void Main() {
    for (int i = 0; i < 3; i++) Console.WriteLine($"Hello #{i}");
  }
}
`;

const fsharp = `// F# — PLInt
[<EntryPoint>]
let main _ =
    for i in 0 .. 2 do printfn "Hello #%d" i
    0
`;

const swift = `// Swift — PLInt
for i in 0..<3 {
  print("Hello #\\(i)")
}
`;

const dart = `// Dart — PLInt
void main() {
  for (var i = 0; i < 3; i++) print('Hello #\$i');
}
`;

const c = `// C — PLInt
#include <stdio.h>
int main(void) {
  for (int i = 0; i < 3; i++) printf("Hello #%d\\n", i);
  return 0;
}
`;

const cpp = `// C++ — PLInt
#include <iostream>
int main() {
  for (int i = 0; i < 3; i++) std::cout << "Hello #" << i << "\\n";
}
`;

const rust = `// Rust — PLInt
fn main() {
    for i in 0..3 {
        println!("Hello #{}", i);
    }
}
`;

const zig = `// Zig — PLInt
const std = @import("std");
pub fn main() !void {
    var i: u8 = 0;
    while (i < 3) : (i += 1) {
        std.debug.print("Hello #{}\\n", .{i});
    }
}
`;

const nim = `# Nim — PLInt
for i in 0..2:
  echo "Hello #", i
`;

const nix = `# Nix — PLInt
let
  greet = name: "Hello, \${name}!";
in
  builtins.map (i: greet ("world #" + toString i)) [0 1 2]
`;

const go = `// Go — PLInt
package main
import "fmt"
func main() {
  for i := 0; i < 3; i++ { fmt.Printf("Hello #%d\\n", i) }
}
`;

const haskell = `-- Haskell — PLInt
main :: IO ()
main = mapM_ (\\i -> putStrLn ("Hello #" ++ show i)) [0..2]
`;

const ocaml = `(* OCaml — PLInt *)
let () =
  for i = 0 to 2 do
    Printf.printf "Hello #%d\\n" i
  done
`;

const elixir = `# Elixir — PLInt
for i <- 0..2, do: IO.puts("Hello ##{i}")
`;

const julia = `# Julia — PLInt
for i in 0:2
  println("Hello #", i)
end
`;

const haxe = `// Haxe — PLInt
class Main {
  static function main() {
    for (i in 0...3) trace('Hello #\$i');
  }
}
`;

const sql = `-- SQL (SQLite dialect via sql.js) — PLInt
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INT);
INSERT INTO users (name, age) VALUES ('Ada', 36), ('Linus', 55), ('Grace', 85);
SELECT name, age FROM users ORDER BY age DESC;
`;

const bash = `#!/usr/bin/env bash
# Bash — PLInt
for i in 1 2 3; do
  echo "Hello #$i"
done
`;

const ps = `# PowerShell — PLInt
1..3 | ForEach-Object { Write-Host "Hello #$_" }
`;

const bat = `@echo off
REM Batch — PLInt
for /L %%i in (1,1,3) do echo Hello #%%i
`;

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>PLInt — HTML</title>
    <style>
      body { font-family: system-ui, sans-serif; background: #0f1418; color: #e3ecf1; padding: 2rem; }
      h1 { color: #b8ecdc; }
    </style>
  </head>
  <body>
    <h1>Hello, world!</h1>
    <p>Live HTML preview powered by PLInt.</p>
    <button onclick="alert('It works!')">Click me</button>
  </body>
</html>
`;

// --- weird ---
const svelte = `<!-- Svelte — PLInt -->
<script>
  let count = 0;
</script>
<button on:click={() => count += 1}>
  Clicked {count} times
</button>
`;

const smali = `# Smali — PLInt
.class public LHello;
.super Ljava/lang/Object;

.method public static main([Ljava/lang/String;)V
    .registers 2
    sget-object v0, Ljava/lang/System;->out:Ljava/io/PrintStream;
    const-string v1, "Hello, world!"
    invoke-virtual {v0, v1}, Ljava/io/PrintStream;->println(Ljava/lang/String;)V
    return-void
.end method
`;

// --- esoteric ---
const brainfuck = `++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
`;

const malbolge = `('&%:9]!~}|z2Vxwv-,POqponl$Hjig%eB@@>}=<M:9wv6WsU2T|nm-,jcL(I&%$#"
\`CB]V?Tx<uVtT\`Rpo3NlF.Jh++FdbCBA@?]!~|4XzyTT43Qsqq(Lnmkj"Fhg\${z@>
`;

const lolcode = `HAI 1.4
  I HAS A NUM ITZ 0
  IM IN YR LOOP UPPIN YR NUM WILE BOTH SAEM NUM AN SMALLR OF NUM AN 2
    VISIBLE SMOOSH "Hello #" NUM MKAY
  IM OUTTA YR LOOP
KTHXBYE
`;

const shakespeare = `The Infamous Hello World Program.

Romeo, a young man with a remarkable patience.
Juliet, a likewise young woman of remarkable grace.

                    Act I: Hamlet's insults and flattery.

                    Scene I: The insulting of Romeo.

[Enter Romeo and Juliet]

Juliet:
 You are as lovely as a summer's day! Speak your mind!

[Exeunt]
`;

// ---------------- catalog ----------------

const CORE: LanguageDef[] = [
  // --- scripting / dynamic ---
  {
    id: "python", name: "Python", monaco: "python", runtime: "python",
    ext: ".py", sample: py,
    syntax: { comment: "# comment", variable: "x = 10", fn: "def f(x): ...", io: "print(x)", loop: "for i in range(n):", conditional: "if x > 0: ..." },
  },
  {
    id: "ruby", name: "Ruby", monaco: "ruby", runtime: "ruby",
    ext: ".rb", sample: rb,
    syntax: { comment: "# comment", variable: "x = 10", fn: "def f(x) ... end", io: "puts x", loop: "n.times do |i| ... end", conditional: "if x > 0 then ... end" },
  },
  {
    id: "perl", name: "Perl", monaco: "perl", runtime: "server", serverId: "perl",
    ext: ".pl", sample: perl,
    syntax: { comment: "# comment", variable: "my $x = 10;", fn: "sub f { my ($x) = @_; ... }", io: "print $x;", loop: "for my $i (0..$n) { ... }", conditional: "if ($x > 0) { ... }" },
  },
  {
    id: "lua", name: "Lua", monaco: "lua", runtime: "lua",
    ext: ".lua", sample: lua,
    syntax: { comment: "-- comment", variable: "local x = 10", fn: "function f(x) ... end", io: "print(x)", loop: "for i = 1, n do ... end", conditional: "if x > 0 then ... end" },
  },
  {
    id: "r", name: "R", monaco: "r", runtime: "server", serverId: "r",
    ext: ".R", sample: r,
    syntax: { comment: "# comment", variable: "x <- 10", fn: "f <- function(x) ...", io: "cat(x)", loop: "for (i in 1:n) { ... }", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "julia", name: "Julia", monaco: "julia", runtime: "server", serverId: "julia",
    ext: ".jl", sample: julia,
    syntax: { comment: "# comment", variable: "x = 10", fn: "function f(x) ... end", io: "println(x)", loop: "for i in 1:n ... end", conditional: "if x > 0 ... end" },
  },
  {
    id: "elixir", name: "Elixir", monaco: "elixir", runtime: "server", serverId: "elixir",
    ext: ".exs", sample: elixir,
    syntax: { comment: "# comment", variable: "x = 10", fn: "def f(x), do: ...", io: "IO.puts(x)", loop: "Enum.each(list, fn i -> ... end)", conditional: "if x > 0 do ... end" },
  },
  {
    id: "php", name: "PHP", monaco: "php", runtime: "php",
    ext: ".php", sample: php,
    syntax: { comment: "// comment", variable: "$x = 10;", fn: "function f($x) { ... }", io: "echo $x;", loop: "for ($i=0; $i<$n; $i++)", conditional: "if ($x > 0) { ... }" },
  },

  // --- web ---
  {
    id: "html", name: "HTML", monaco: "html", runtime: "html",
    ext: ".html", sample: html,
    syntax: { comment: "<!-- comment -->", variable: "<div id=\"x\">…</div>", fn: "<script>function f(){}</script>", io: "document.write(x)", loop: "for (…) …", conditional: "if (…) …" },
  },
  {
    id: "javascript", name: "JavaScript", monaco: "javascript", runtime: "js",
    ext: ".js", sample: js,
    syntax: { comment: "// comment", variable: "const x = 10;", fn: "const f = (x) => ...", io: "console.log(x)", loop: "for (let i = 0; i < n; i++)", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "typescript", name: "TypeScript", monaco: "typescript", runtime: "ts",
    ext: ".ts", sample: ts,
    syntax: { comment: "// comment", variable: "const x: number = 10;", fn: "const f = (x: T): U => ...", io: "console.log(x)", loop: "for (const v of xs)", conditional: "if (x > 0) { ... }" },
  },

  // --- JVM ---
  {
    id: "java", name: "Java", monaco: "java", runtime: "server", serverId: "java",
    ext: ".java", sample: java,
    syntax: { comment: "// comment", variable: "int x = 10;", fn: "int f(int x) { ... }", io: "System.out.println(x);", loop: "for (int i = 0; i < n; i++)", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "kotlin", name: "Kotlin", monaco: "kotlin", runtime: "server", serverId: "kotlin",
    ext: ".kt", sample: kt,
    syntax: { comment: "// comment", variable: "val x = 10", fn: "fun f(x: Int): Int = ...", io: "println(x)", loop: "for (i in 0 until n)", conditional: "if (x > 0) { ... }" },
  },

  // --- .NET ---
  {
    id: "csharp", name: "C#", monaco: "csharp", runtime: "server", serverId: "csharp",
    ext: ".cs", sample: cs,
    syntax: { comment: "// comment", variable: "int x = 10;", fn: "int F(int x) => ...;", io: "Console.WriteLine(x);", loop: "for (int i = 0; i < n; i++)", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "fsharp", name: "F#", monaco: "fsharp", runtime: "server", serverId: "fsharp",
    ext: ".fs", sample: fsharp,
    syntax: { comment: "// comment", variable: "let x = 10", fn: "let f x = ...", io: "printfn \"%d\" x", loop: "for i in 0 .. n do ...", conditional: "if x > 0 then ... else ..." },
  },

  // --- mobile / cross-platform ---
  {
    id: "swift", name: "Swift", monaco: "swift", runtime: "server", serverId: "swift",
    ext: ".swift", sample: swift,
    syntax: { comment: "// comment", variable: "let x = 10", fn: "func f(_ x: Int) -> Int { ... }", io: "print(x)", loop: "for i in 0..<n", conditional: "if x > 0 { ... }" },
  },
  {
    id: "dart", name: "Dart", monaco: "dart", runtime: "server", serverId: "dart",
    ext: ".dart", sample: dart,
    syntax: { comment: "// comment", variable: "var x = 10;", fn: "int f(int x) => ...;", io: "print(x);", loop: "for (var i = 0; i < n; i++)", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "haxe", name: "Haxe", monaco: "haxe", runtime: "server", serverId: "haxe",
    ext: ".hx", sample: haxe,
    syntax: { comment: "// comment", variable: "var x = 10;", fn: "function f(x:Int):Int { ... }", io: "trace(x);", loop: "for (i in 0...n)", conditional: "if (x > 0) { ... }" },
  },

  // --- systems ---
  {
    id: "c", name: "C", monaco: "c", runtime: "server", serverId: "c",
    ext: ".c", sample: c,
    syntax: { comment: "// comment", variable: "int x = 10;", fn: "int f(int x) { ... }", io: "printf(\"%d\\n\", x);", loop: "for (int i = 0; i < n; i++)", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "cpp", name: "C++", monaco: "cpp", runtime: "server", serverId: "cpp",
    ext: ".cpp", sample: cpp,
    syntax: { comment: "// comment", variable: "auto x = 10;", fn: "int f(int x) { ... }", io: "std::cout << x;", loop: "for (int i = 0; i < n; i++)", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "rust", name: "Rust", monaco: "rust", runtime: "server", serverId: "rust",
    ext: ".rs", sample: rust,
    syntax: { comment: "// comment", variable: "let x = 10;", fn: "fn f(x: i32) -> i32 { ... }", io: "println!(\"{}\", x);", loop: "for i in 0..n { ... }", conditional: "if x > 0 { ... }" },
  },
  {
    id: "zig", name: "Zig", monaco: "zig", runtime: "server", serverId: "zig",
    ext: ".zig", sample: zig,
    syntax: { comment: "// comment", variable: "const x: i32 = 10;", fn: "fn f(x: i32) i32 { ... }", io: "std.debug.print(\"{}\", .{x});", loop: "while (i < n) : (i += 1)", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "nim", name: "Nim", monaco: "nim", runtime: "server", serverId: "nim",
    ext: ".nim", sample: nim,
    syntax: { comment: "# comment", variable: "var x = 10", fn: "proc f(x: int): int = ...", io: "echo x", loop: "for i in 0..n: ...", conditional: "if x > 0: ..." },
  },
  {
    id: "go", name: "Go", monaco: "go", runtime: "server", serverId: "go",
    ext: ".go", sample: go,
    syntax: { comment: "// comment", variable: "x := 10", fn: "func f(x int) int { ... }", io: "fmt.Println(x)", loop: "for i := 0; i < n; i++", conditional: "if x > 0 { ... }" },
  },

  // --- functional ---
  {
    id: "haskell", name: "Haskell", monaco: "haskell", runtime: "server", serverId: "haskell",
    ext: ".hs", sample: haskell,
    syntax: { comment: "-- comment", variable: "let x = 10", fn: "f x = ...", io: "putStrLn (show x)", loop: "mapM_ f [0..n]", conditional: "if x > 0 then ... else ..." },
  },
  {
    id: "ocaml", name: "OCaml", monaco: "ocaml", runtime: "server", serverId: "ocaml",
    ext: ".ml", sample: ocaml,
    syntax: { comment: "(* comment *)", variable: "let x = 10", fn: "let f x = ...", io: "print_int x", loop: "for i = 0 to n do ... done", conditional: "if x > 0 then ... else ..." },
  },

  // --- config / niche ---
  {
    id: "nix", name: "Nix", monaco: "nix", runtime: "server", serverId: "nix",
    ext: ".nix", sample: nix,
    syntax: { comment: "# comment", variable: "let x = 10; in ...", fn: "f = x: ...;", io: "builtins.trace x null", loop: "map (i: ...) list", conditional: "if x > 0 then ... else ..." },
  },

  // --- data / shell ---
  {
    id: "sql", name: "SQL", monaco: "sql", runtime: "sql",
    ext: ".sql", sample: sql,
    syntax: { comment: "-- comment", variable: "DECLARE @x INT;", fn: "CREATE FUNCTION f ...", io: "SELECT x;", loop: "WHILE cond DO ...", conditional: "CASE WHEN cond THEN ..." },
  },
  {
    id: "bash", name: "Bash / Shell", monaco: "shell", runtime: "server", serverId: "bash",
    ext: ".sh", sample: bash,
    syntax: { comment: "# comment", variable: "x=10", fn: "greet() { echo $1; }", io: "echo $x", loop: "for i in 1 2 3; do ... done", conditional: "if [ $x -gt 0 ]; then ... fi" },
  },
  {
    id: "powershell", name: "PowerShell", monaco: "powershell", runtime: "server", serverId: "powershell",
    ext: ".ps1", sample: ps,
    syntax: { comment: "# comment", variable: "$x = 10", fn: "function Greet($n) { ... }", io: "Write-Host $x", loop: "foreach ($i in 1..3) { ... }", conditional: "if ($x -gt 0) { ... }" },
  },
  {
    id: "batch", name: "Batch", monaco: "bat", runtime: "server", serverId: "batch",
    ext: ".bat", sample: bat,
    syntax: { comment: "REM comment", variable: "set X=10", fn: ":label ... goto :eof", io: "echo %X%", loop: "for /L %%i in (1,1,3) do ...", conditional: "if %X% GTR 0 ..." },
  },
];

export const WEIRD: LanguageDef[] = [
  {
    id: "svelte", name: "Svelte", monaco: "svelte", runtime: "server", serverId: "svelte",
    ext: ".svelte", sample: svelte, group: "weird",
    syntax: { comment: "<!-- comment -->", variable: "let x = 10;", fn: "function f() {}", io: "{x}", loop: "{#each xs as x} ... {/each}", conditional: "{#if x} ... {/if}" },
  },
  {
    id: "smali", name: "Smali", monaco: "smali", runtime: "server", serverId: "smali",
    ext: ".smali", sample: smali, group: "weird",
    syntax: { comment: "# comment", variable: ".local v0", fn: ".method public foo()V", io: "invoke-virtual …println(…)", loop: ":goto_0 … goto :goto_0", conditional: "if-eqz v0, :cond_0" },
  },
];

export const ESOTERIC: LanguageDef[] = [
  {
    id: "brainfuck", name: "Brainfuck", monaco: "brainfuck", runtime: "brainfuck",
    ext: ".bf", sample: brainfuck, group: "esoteric",
    syntax: { comment: "(anything not +-<>[].,)", variable: "cell (30k tape)", fn: "n/a", io: ". , (out / in)", loop: "[ … ]", conditional: "[ … ] (skip if zero)" },
  },
  {
    id: "malbolge", name: "Malbolge", monaco: "malbolge", runtime: "server", serverId: "malbolge",
    ext: ".mb", sample: malbolge, group: "esoteric",
    syntax: { comment: "n/a", variable: "trit registers a,c,d", fn: "n/a", io: "*, / (out / in)", loop: "self-modifying", conditional: "encrypted opcodes" },
  },
  {
    id: "lolcode", name: "LOLCODE", monaco: "lolcode", runtime: "server", serverId: "lolcode",
    ext: ".lol", sample: lolcode, group: "esoteric",
    syntax: { comment: "BTW comment", variable: "I HAS A X ITZ 10", fn: "HOW IZ I F YR X …", io: "VISIBLE X", loop: "IM IN YR LOOP … IM OUTTA YR LOOP", conditional: "O RLY? … OIC" },
  },
  {
    id: "shakespeare", name: "Shakespeare", monaco: "shakespeare", runtime: "server", serverId: "shakespeare",
    ext: ".spl", sample: shakespeare, group: "esoteric",
    syntax: { comment: "stage directions", variable: "characters", fn: "acts / scenes", io: "Speak your mind!", loop: "Let us return to scene I", conditional: "Am I better than you?" },
  },
];

export const ALL_LANGUAGES: LanguageDef[] = [...CORE, ...WEIRD, ...ESOTERIC];
export const LANGUAGES: LanguageDef[] = CORE; // back-compat default list
export const LANG_BY_ID: Record<string, LanguageDef> = Object.fromEntries(
  ALL_LANGUAGES.map((l) => [l.id, l])
);
