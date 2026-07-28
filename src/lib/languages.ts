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
  | "markdown"
  | "coffeescript"
  | "brainfuck"
  | "server";

export type LanguageGroup = "core" | "weird" | "esoteric" | "assembly";

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

// ---------------- extra core (JVM / BEAM) ----------------

const scala = `// Scala — PLInt
object Main extends App {
  (0 until 3).foreach(i => println(s"Hello #$i"))
}
`;
const clojure = `; Clojure — PLInt
(dotimes [i 3] (println (str "Hello #" i)))
`;
const erlang = `%% Erlang — PLInt
-module(main).
-export([main/0]).
main() ->
    lists:foreach(fun(I) -> io:format("Hello #~p~n", [I]) end, lists:seq(0, 2)).
`;

CORE.push(
  {
    id: "scala", name: "Scala", monaco: "scala", runtime: "server", serverId: "scala",
    ext: ".scala", sample: scala,
    syntax: { comment: "// comment", variable: "val x = 10", fn: "def f(x: Int): Int = ...", io: "println(x)", loop: "for (i <- 0 until n)", conditional: "if (x > 0) ..." },
  },
  {
    id: "clojure", name: "Clojure", monaco: "clojure", runtime: "server", serverId: "clojure",
    ext: ".clj", sample: clojure,
    syntax: { comment: "; comment", variable: "(def x 10)", fn: "(defn f [x] ...)", io: "(println x)", loop: "(dotimes [i n] ...)", conditional: "(if (> x 0) ... ...)" },
  },
  {
    id: "erlang", name: "Erlang", monaco: "erlang", runtime: "server", serverId: "erlang",
    ext: ".erl", sample: erlang,
    syntax: { comment: "%% comment", variable: "X = 10.", fn: "f(X) -> ... .", io: "io:format(\"~p~n\", [X]).", loop: "lists:foreach(fun(I)-> ... end, L).", conditional: "case X of _ -> ... end." },
  },
);

// ---------------- more core (added Aug 2025) ----------------
const objc = `// Objective-C — PLInt
#import <Foundation/Foundation.h>
int main() { @autoreleasepool { NSLog(@"Hello, world!"); } return 0; }
`;
const objcpp = `// Objective-C++ — PLInt
#import <Foundation/Foundation.h>
#include <string>
int main() { @autoreleasepool { std::string s = "world"; NSLog(@"Hello, %s!", s.c_str()); } return 0; }
`;
const crystal = `# Crystal — PLInt
3.times { |i| puts "Hello ##{i}" }
`;
const vlang = `// V — PLInt
fn main() { for i in 0 .. 3 { println('Hello #$i') } }
`;
const gleam = `// Gleam — PLInt
import gleam/io
pub fn main() { io.println("Hello, world!") }
`;
const solidity = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Hello { function greet() public pure returns (string memory) { return "Hello, world!"; } }
`;
const elm = `-- Elm — PLInt
module Main exposing (main)
import Html exposing (text)
main = text "Hello, world!"
`;
const dlang = `// D — PLInt
import std.stdio;
void main() { foreach (i; 0 .. 3) writeln("Hello #", i); }
`;
const fortran = `! Fortran — PLInt
program hello
  integer :: i
  do i = 0, 2
    print *, "Hello #", i
  end do
end program hello
`;
const cobol = `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HELLO.
       PROCEDURE DIVISION.
           DISPLAY "Hello, world!".
           STOP RUN.
`;
const awk = `# AWK — PLInt
BEGIN { for (i = 0; i < 3; i++) print "Hello #" i }
`;
const clisp = `;; Common Lisp — PLInt
(dotimes (i 3) (format t "Hello #~a~%" i))
`;

CORE.push(
  { id: "objc", name: "Objective-C", monaco: "objective-c", runtime: "server", serverId: "objc",
    ext: ".m", sample: objc,
    syntax: { comment: "// comment", variable: "NSString *s = @\"x\";", fn: "- (void)foo { ... }", io: "NSLog(@\"%@\", s);", loop: "for (int i=0;i<n;i++)", conditional: "if (x) { ... }" } },
  { id: "objcpp", name: "Objective-C++", monaco: "objective-c", runtime: "server", serverId: "objcpp",
    ext: ".mm", sample: objcpp,
    syntax: { comment: "// comment", variable: "auto s = std::string();", fn: "- (void)foo { ... }", io: "NSLog(...); std::cout <<", loop: "for (auto& x : xs)", conditional: "if (x) { ... }" } },
  { id: "crystal", name: "Crystal", monaco: "crystal", runtime: "server", serverId: "crystal",
    ext: ".cr", sample: crystal,
    syntax: { comment: "# comment", variable: "x = 10", fn: "def f(x) ... end", io: "puts x", loop: "n.times { |i| ... }", conditional: "if x > 0 ... end" } },
  { id: "vlang", name: "V", monaco: "go", runtime: "server", serverId: "v",
    ext: ".v", sample: vlang,
    syntax: { comment: "// comment", variable: "x := 10", fn: "fn f(x int) int { ... }", io: "println(x)", loop: "for i in 0..n { ... }", conditional: "if x > 0 { ... }" } },
  { id: "gleam", name: "Gleam", monaco: "plaintext", runtime: "server", serverId: "gleam",
    ext: ".gleam", sample: gleam,
    syntax: { comment: "// comment", variable: "let x = 10", fn: "pub fn f(x) { ... }", io: "io.println(x)", loop: "list.each(xs, fn(x) { ... })", conditional: "case x { ... }" } },
  { id: "solidity", name: "Solidity", monaco: "sol", runtime: "server", serverId: "solidity",
    ext: ".sol", sample: solidity,
    syntax: { comment: "// comment", variable: "uint256 x = 10;", fn: "function f() public { ... }", io: "emit Event(x);", loop: "for (uint i; i<n; i++)", conditional: "if (x > 0) { ... }" } },
  { id: "elm", name: "Elm", monaco: "elm", runtime: "server", serverId: "elm",
    ext: ".elm", sample: elm,
    syntax: { comment: "-- comment", variable: "x = 10", fn: "f x = ...", io: "text \"x\"", loop: "List.map f xs", conditional: "if x > 0 then ... else ..." } },
  { id: "dlang", name: "D", monaco: "d", runtime: "server", serverId: "d",
    ext: ".d", sample: dlang,
    syntax: { comment: "// comment", variable: "auto x = 10;", fn: "int f(int x) { ... }", io: "writeln(x);", loop: "foreach (i; 0 .. n)", conditional: "if (x > 0) { ... }" } },
  { id: "fortran", name: "Fortran", monaco: "plaintext", runtime: "server", serverId: "fortran",
    ext: ".f90", sample: fortran,
    syntax: { comment: "! comment", variable: "integer :: x", fn: "subroutine f(x) ... end", io: "print *, x", loop: "do i = 0, n ... end do", conditional: "if (x > 0) then ... end if" } },
  { id: "cobol", name: "COBOL", monaco: "plaintext", runtime: "server", serverId: "cobol",
    ext: ".cob", sample: cobol,
    syntax: { comment: "* comment", variable: "01 X PIC 9.", fn: "PROCEDURE DIVISION.", io: "DISPLAY X.", loop: "PERFORM N TIMES", conditional: "IF X > 0 ... END-IF" } },
  { id: "awk", name: "AWK", monaco: "plaintext", runtime: "server", serverId: "awk",
    ext: ".awk", sample: awk,
    syntax: { comment: "# comment", variable: "x = 10", fn: "function f(x) { ... }", io: "print x", loop: "for (i=0;i<n;i++)", conditional: "if (x > 0) { ... }" } },
  { id: "clisp", name: "Common Lisp", monaco: "scheme", runtime: "server", serverId: "clisp",
    ext: ".lisp", sample: clisp,
    syntax: { comment: ";; comment", variable: "(defvar x 10)", fn: "(defun f (x) ...)", io: "(format t \"~a\" x)", loop: "(dotimes (i n) ...)", conditional: "(if (> x 0) ... ...)" } },
);

// ---------------- more core (2026 batch) ----------------
const coffee = `# CoffeeScript — PLInt
greet = (name) -> "Hello, #{name}!"
console.log greet "world ##{i}" for i in [0...3]
`;
const actionscript = `// ActionScript 3 — PLInt
package {
  public class Hello {
    public function Hello() {
      for (var i:int = 0; i < 3; i++) trace("Hello #" + i);
    }
  }
}
`;
const matlab = `% MATLAB / Octave — PLInt
function greet(name)
  fprintf("Hello, %s!\\n", name);
end
for i = 0:2
  greet(sprintf("world #%d", i));
end
`;
const ada = `-- Ada — PLInt
with Ada.Text_IO; use Ada.Text_IO;
procedure Hello is
begin
  for I in 0 .. 2 loop
    Put_Line("Hello #" & Integer'Image(I));
  end loop;
end Hello;
`;
const pascal = `{ Pascal — PLInt }
program Hello;
var i: integer;
begin
  for i := 0 to 2 do
    writeln('Hello #', i);
end.
`;
const smalltalk = `"Smalltalk — PLInt"
1 to: 3 do: [:i | Transcript showCr: 'Hello #', i printString].
`;
const mojo = `# Mojo — PLInt
fn greet(name: String) -> String:
    return "Hello, " + name + "!"

fn main():
    for i in range(3):
        print(greet("world #" + String(i)))
`;
const markdown = `# Markdown — PLInt

A **live preview** renders below, just like the HTML runtime.

- Bullet one
- Bullet two

\`\`\`
code block
\`\`\`

> Rendered client-side with a sandboxed, sanitized HTML preview.
`;
const groovy = `// Groovy — PLInt
def greet(name) { "Hello, \${name}!" }
(0..2).each { i -> println greet("world #\${i}") }
`;

CORE.push(
  { id: "coffeescript", name: "CoffeeScript", monaco: "coffeescript", runtime: "coffeescript",
    ext: ".coffee", sample: coffee,
    syntax: { comment: "# comment", variable: "x = 10", fn: "f = (x) -> x + 1", io: "console.log x", loop: "for i in [0...n]", conditional: "if x > 0 then ... else ..." } },
  { id: "actionscript", name: "ActionScript", monaco: "actionscript", runtime: "server", serverId: "actionscript",
    ext: ".as", sample: actionscript,
    syntax: { comment: "// comment", variable: "var x:int = 10;", fn: "function f(x:int):int { ... }", io: "trace(x);", loop: "for (var i:int=0;i<n;i++)", conditional: "if (x > 0) { ... }" } },
  { id: "matlab", name: "MATLAB", monaco: "matlab", runtime: "server", serverId: "matlab",
    ext: ".m", sample: matlab,
    syntax: { comment: "% comment", variable: "x = 10;", fn: "function y = f(x) ... end", io: "fprintf(\"%d\", x);", loop: "for i = 1:n ... end", conditional: "if x > 0 ... end" } },
  { id: "ada", name: "Ada", monaco: "ada", runtime: "server", serverId: "ada",
    ext: ".adb", sample: ada,
    syntax: { comment: "-- comment", variable: "X : Integer := 10;", fn: "function F (X : Integer) return Integer is ...", io: "Put_Line(...)", loop: "for I in 0 .. N loop ... end loop;", conditional: "if X > 0 then ... end if;" } },
  { id: "pascal", name: "Pascal", monaco: "pascal", runtime: "server", serverId: "pascal",
    ext: ".pas", sample: pascal,
    syntax: { comment: "{ comment }", variable: "var x: integer;", fn: "function f(x: integer): integer; ...", io: "writeln(x);", loop: "for i := 0 to n do ...", conditional: "if x > 0 then ... else ..." } },
  { id: "smalltalk", name: "Smalltalk", monaco: "smalltalk", runtime: "server", serverId: "smalltalk",
    ext: ".st", sample: smalltalk,
    syntax: { comment: "\"comment\"", variable: "x := 10.", fn: "f: x ^x + 1", io: "Transcript showCr: x printString.", loop: "1 to: n do: [:i | ...]", conditional: "x > 0 ifTrue: [...] ifFalse: [...]" } },
  { id: "mojo", name: "Mojo", monaco: "python", runtime: "server", serverId: "mojo",
    ext: ".mojo", sample: mojo,
    syntax: { comment: "# comment", variable: "var x: Int = 10", fn: "fn f(x: Int) -> Int: ...", io: "print(x)", loop: "for i in range(n): ...", conditional: "if x > 0: ... else: ..." } },
  { id: "markdown", name: "Markdown", monaco: "markdown", runtime: "markdown",
    ext: ".md", sample: markdown,
    syntax: { comment: "<!-- comment -->", variable: "n/a", fn: "n/a", io: "renders as HTML preview", loop: "n/a", conditional: "n/a" } },
  { id: "groovy", name: "Groovy", monaco: "groovy", runtime: "server", serverId: "groovy",
    ext: ".groovy", sample: groovy,
    syntax: { comment: "// comment", variable: "def x = 10", fn: "def f(x) { x + 1 }", io: "println x", loop: "(0..<n).each { i -> ... }", conditional: "if (x > 0) { ... } else { ... }" } },
);


// ---------------- weird / esoteric extras ----------------

const cmake = `# CMake — PLInt
cmake_minimum_required(VERSION 3.16)
project(Hello LANGUAGES C)
add_executable(hello hello.c)
message(STATUS "Hello, world!")
`;
const makefile = `# Makefile — PLInt
.PHONY: all
all:
\t@for i in 1 2 3; do echo "Hello #$$i"; done
`;
const whitespace = `   \t  \t   \n\t\n     \t\t \t  \t\n\t\n     \t \t \n\t\n  \n\n\n`;
const binaryLang = `01001000 01100101 01101100 01101100 01101111 00100001
; Binary — each 8-bit byte is one ASCII character.
`;
const malbolgeU = `('&%:9]!~}|z2Vxwv-,POqponl$Hjig%eB@@>}=<M:9wv6WsU2T|nm-,jcL(I&%$#"
; Malbolge Unshackled — same encrypted opcodes, unbounded tape width.
`;
const befunge = `"!dlroW ,olleH",,,,,,,,,,,,,@`;
const piet = `# Piet — PLInt
# Piet is a 2D visual language; source is an image of colored codels.
# This text placeholder is for reference only — real programs are PNG images.
`;
const intercal = `PLEASE DO ,1 <- #13
DO ,1 SUB #1 <- #238
PLEASE DO ,1 SUB #2 <- #108
DO ,1 SUB #3 <- #112
PLEASE READ OUT ,1
PLEASE GIVE UP
`;
const chef = `Hello World Souffle.

Ingredients.
72 g haricot beans
101 eggs
108 g lard
111 ml oil

Method.
Put haricot beans into mixing bowl.
Put eggs into mixing bowl.
Liquefy contents of the mixing bowl.
Pour contents of the mixing bowl into the baking dish.

Serves 1.
`;
const ook = `Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook.
Ook. Ook. Ook. Ook. Ook! Ook? Ook. Ook? Ook. Ook. Ook. Ook.
Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook. Ook.
Ook. Ook. Ook? Ook. Ook! Ook! Ook? Ook! Ook. Ook? Ook! Ook.
`;
const deadfish = `iiisiiiiiiiiioiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiio
`;

const svelteAsm = ""; // placeholder unused

// ---------- ASSEMBLY sample (shared, small) ----------
const asmSample = (title: string) => `; ${title} — PLInt sample
; Runs on PLInt's shared assembly simulator (see docs/ARCHITECTURE.md)
    mov     r0, 3
loop:
    prints  "Hello from ${title}!"
    sub     r0, 1
    cmp     r0, 0
    jg      loop
    halt
`;
const wat = `;; WebAssembly Text Format — PLInt
(module
  (func $add (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add)
  (export "add" (func $add)))
`;
const llvmIr = `; LLVM IR — PLInt
define i32 @main() {
  ret i32 0
}
`;
const jasmin = `; Jasmin (JVM bytecode) — PLInt
.class public Hello
.super java/lang/Object

.method public static main([Ljava/lang/String;)V
   .limit stack 2
   getstatic java/lang/System/out Ljava/io/PrintStream;
   ldc "Hello, world!"
   invokevirtual java/io/PrintStream/println(Ljava/lang/String;)V
   return
.end method
`;
const cil = `// CIL / MSIL — PLInt
.assembly Hello {}
.method static void Main() cil managed
{
  .entrypoint
  ldstr "Hello, world!"
  call void [mscorlib]System.Console::WriteLine(string)
  ret
}
`;

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
    id: "malbolge-u", name: "Malbolge Unshackled", monaco: "malbolge", runtime: "server", serverId: "malbolge-u",
    ext: ".mbu", sample: malbolgeU, group: "esoteric",
    syntax: { comment: "n/a", variable: "unbounded trit tape", fn: "n/a", io: "*, / (out / in)", loop: "self-modifying", conditional: "encrypted opcodes" },
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
  {
    id: "whitespace", name: "Whitespace", monaco: "plaintext", runtime: "server", serverId: "whitespace",
    ext: ".ws", sample: whitespace, group: "esoteric",
    syntax: { comment: "only space/tab/LF matter", variable: "stack values", fn: "labelled subroutines", io: "TAB LF S S (out num)", loop: "labels + jumps", conditional: "JZ / JN" },
  },
  {
    id: "binary", name: "Binary", monaco: "plaintext", runtime: "server", serverId: "binary",
    ext: ".bin", sample: binaryLang, group: "esoteric",
    syntax: { comment: "; comment", variable: "raw bytes", fn: "n/a", io: "byte streams", loop: "n/a", conditional: "n/a" },
  },
  {
    id: "befunge", name: "Befunge", monaco: "plaintext", runtime: "server", serverId: "befunge",
    ext: ".bf98", sample: befunge, group: "esoteric",
    syntax: { comment: "2D — no line comments", variable: "stack", fn: "n/a", io: ". , (out) & , ~ (in)", loop: "direction: > < ^ v", conditional: "_ | (H/V branch)" },
  },
  {
    id: "piet", name: "Piet", monaco: "plaintext", runtime: "server", serverId: "piet",
    ext: ".piet", sample: piet, group: "esoteric",
    syntax: { comment: "image only", variable: "codel stack", fn: "n/a", io: "hue shift ops", loop: "direction pointer", conditional: "lightness delta" },
  },
  {
    id: "intercal", name: "INTERCAL", monaco: "plaintext", runtime: "server", serverId: "intercal",
    ext: ".i", sample: intercal, group: "esoteric",
    syntax: { comment: "PLEASE NOTE …", variable: ",1 <- #10", fn: "(1) DO …", io: "READ OUT / WRITE IN", loop: "DO … WHILE (n)", conditional: "DO … IF" },
  },
  {
    id: "chef", name: "Chef", monaco: "plaintext", runtime: "server", serverId: "chef",
    ext: ".chef", sample: chef, group: "esoteric",
    syntax: { comment: "recipe prose", variable: "ingredients", fn: "auxiliary recipe", io: "Serves N.", loop: "Verb the ingredient until …", conditional: "If …" },
  },
  {
    id: "ook", name: "Ook!", monaco: "plaintext", runtime: "server", serverId: "ook",
    ext: ".ook", sample: ook, group: "esoteric",
    syntax: { comment: "n/a", variable: "cell (like Brainfuck)", fn: "n/a", io: "Ook. Ook! (out)", loop: "Ook! Ook? … Ook? Ook!", conditional: "same as loop" },
  },
  {
    id: "deadfish", name: "Deadfish", monaco: "plaintext", runtime: "server", serverId: "deadfish",
    ext: ".df", sample: deadfish, group: "esoteric",
    syntax: { comment: "n/a", variable: "single accumulator", fn: "n/a", io: "o (out num)", loop: "n/a", conditional: "n/a (auto zero at 256)" },
  },
  {
    id: "chicken", name: "Chicken", monaco: "plaintext", runtime: "server", serverId: "chicken",
    ext: ".chn", sample: "chicken chicken\nchicken chicken chicken\n", group: "esoteric",
    syntax: { comment: "n/a", variable: "stack", fn: "n/a", io: "chicken (out)", loop: "n/a", conditional: "chicken chicken" },
  },
  {
    id: "arnoldc", name: "ArnoldC", monaco: "plaintext", runtime: "server", serverId: "arnoldc",
    ext: ".arnoldc", sample: "IT'S SHOWTIME\nTALK TO THE HAND \"Hello, world!\"\nYOU HAVE BEEN TERMINATED\n", group: "esoteric",
    syntax: { comment: "n/a", variable: "HEY CHRISTMAS TREE x", fn: "LISTEN TO ME VERY CAREFULLY", io: "TALK TO THE HAND", loop: "STICK AROUND ... CHILL", conditional: "BECAUSE I'M GOING TO SAY PLEASE" },
  },
  {
    id: "rockstar", name: "Rockstar", monaco: "rockstar", runtime: "server", serverId: "rockstar",
    ext: ".rock", sample: "Tommy was a lovestruck ladykiller\nShout Tommy\n", group: "esoteric",
    syntax: { comment: "(comment)", variable: "Put 5 into X", fn: "Foo takes X and Y", io: "Shout X", loop: "While X is greater than 0", conditional: "If X is nothing" },
  },
];


// Convenience: build assembly entries with a shared template.
function asm(id: string, name: string, ext: string, serverId?: string, sampleText?: string, monacoLang = "plint-asm"): LanguageDef {
  return {
    id, name, monaco: monacoLang, runtime: "server", serverId: serverId ?? id,
    ext, sample: sampleText ?? asmSample(name), group: "assembly",
    syntax: {
      comment: "; comment",
      variable: "registers / memory",
      fn: "label: … ret",
      io: "syscall / int / bl",
      loop: "cmp + jcc → label",
      conditional: "cmp + jcc",
    },
  };
}


export const ASSEMBLY: LanguageDef[] = [
  asm("asm-x86_64", "x86-64 / x64 Assembly", ".s"),
  asm("asm-x86", "x86 Assembly", ".asm"),
  asm("asm-arm", "ARM Assembly", ".s"),
  asm("asm-arm-cm", "ARM Cortex-M Assembly", ".s"),
  asm("asm-riscv", "RISC-V Assembly", ".s"),
  asm("asm-avr", "AVR Assembly", ".s"),
  asm("asm-pic", "PIC Assembly", ".asm"),
  asm("asm-xtensa", "ESP32 / Tensilica Xtensa Assembly", ".s"),
  asm("asm-6502", "MOS 6502 Assembly", ".s"),
  asm("asm-z80", "Zilog Z80 Assembly", ".z80"),
  asm("asm-m68k", "Motorola 68000 / m68k Assembly", ".s"),
  asm("asm-mips", "MIPS Assembly", ".s"),
  asm("asm-ppc", "PowerPC / POWER Assembly", ".s"),
  asm("asm-sparc", "SPARC Assembly", ".s"),
  asm("asm-s390", "IBM System/360 & z/Architecture Assembly", ".s"),
  asm("asm-wat", "WebAssembly Text Format", ".wat", "wat", wat, "wat"),
  asm("asm-ebpf", "eBPF Assembly", ".ebpf"),
  asm("asm-llvm", "LLVM Intermediate Representation", ".ll", "llvm", llvmIr, "llvm-ir"),
  asm("asm-jasmin", "Java Bytecode / Jasmin Assembly", ".j", "jasmin", jasmin),
  asm("asm-cil", "CIL / MSIL", ".il", "cil", cil),
  asm("asm-intel", "Intel Syntax", ".asm"),
  asm("asm-att", "AT&T Syntax", ".s"),
  asm("asm-nasm", "NASM", ".asm"),
  asm("asm-masm", "MASM", ".asm"),
  asm("asm-gas", "GNU Assembler (GAS)", ".s"),
  // New — main set
  asm("asm-sm83", "Game Boy / Sharp SM83 Assembly", ".asm"),
  asm("asm-ia64", "IA-64 / Itanium Assembly", ".s"),
  asm("asm-sh", "SuperH Assembly", ".s"),
  asm("asm-alpha", "DEC Alpha Assembly", ".s"),
  asm("asm-pdp11", "PDP-11 Assembly", ".mac"),
  asm("asm-vax", "VAX Assembly", ".s"),
  asm("asm-1802", "RCA 1802 COSMAC Assembly", ".asm"),
  // Bonus — syntaxes & exotic
  asm("asm-aarch64", "AArch64 Assembly", ".s"),
  asm("asm-fasm", "FASM", ".asm"),
  asm("asm-yasm", "YASM", ".asm"),
  asm("asm-subleq", "Subleq / OISC Assembly", ".sq"),
  // Extras
  asm("asm-tasm", "TASM (Turbo Assembler)", ".asm"),
  asm("asm-hla", "HLA (High-Level Assembly)", ".hla"),
  asm("asm-tricore", "Infineon TriCore Assembly", ".s"),
  asm("asm-hexagon", "Qualcomm Hexagon Assembly", ".s"),
  // Requested batch — historical, embedded and vendor architectures
  asm("asm-cdc6600", "CDC 6000 / 6600 Assembly", ".asm"),
  asm("asm-univac1100", "UNIVAC 1100/2200 Assembly", ".asm"),
  asm("asm-sgi-irix", "SGI MIPS / IRIX Assembly", ".s"),
  asm("asm-8051", "Atmel 8051 Assembly", ".asm"),
  asm("asm-msp430", "Texas Instruments MSP430 Assembly", ".s"),
  asm("asm-tms320c6000", "TI TMS320C6000 DSP Assembly", ".asm"),
  asm("asm-pic32", "Microchip PIC32 Assembly", ".s"),
  asm("asm-i860-i960", "Intel i860 / i960 Assembly", ".s"),
  asm("asm-crusoe", "Transmeta Crusoe Code Morphing Assembly", ".s"),
  asm("asm-agc", "Apollo Guidance Computer Assembly", ".agc"),
];


WEIRD.push(
  {
    id: "cmake", name: "CMake", monaco: "cmake", runtime: "server", serverId: "cmake",
    ext: ".cmake", sample: cmake, group: "weird",
    syntax: { comment: "# comment", variable: "set(X value)", fn: "function(name ARGS)\n…\nendfunction()", io: "message(STATUS \"x\")", loop: "foreach(i RANGE 3)\n…\nendforeach()", conditional: "if(cond)\n…\nendif()" },
  },
  {
    id: "makefile", name: "Makefile", monaco: "makefile", runtime: "server", serverId: "makefile",
    ext: "Makefile", sample: makefile, group: "weird",
    syntax: { comment: "# comment", variable: "X = 10", fn: "target: deps\\n\\trecipe", io: "@echo $(X)", loop: "for i in 1 2; do ... ; done", conditional: "ifeq ($(X),1)\\n…\\nendif" },
  },
);

export const ALL_LANGUAGES: LanguageDef[] = [...CORE, ...WEIRD, ...ESOTERIC, ...ASSEMBLY];
export const LANGUAGES: LanguageDef[] = CORE; // back-compat default list
export const LANG_BY_ID: Record<string, LanguageDef> = Object.fromEntries(
  ALL_LANGUAGES.map((l) => [l.id, l])
);

