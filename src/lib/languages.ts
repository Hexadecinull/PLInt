// Language catalog for PLInt.
// Each entry describes how the editor and runner should behave.

export type RuntimeKind =
  | "js"
  | "ts"
  | "python"
  | "lua"
  | "sql"
  | "ruby"
  | "php"
  | "server";

export interface LanguageDef {
  id: string;
  name: string;
  /** Monaco language id used for highlighting. */
  monaco: string;
  /** Which runtime pipeline handles execution. */
  runtime: RuntimeKind;
  /** Optional server-runner id (piston/judge0/etc naming) for server-backed langs. */
  serverId?: string;
  /** File extension shown as a hint. */
  ext: string;
  /** Sample program shown when the language is selected. */
  sample: string;
  /** Short syntax cheatsheet. */
  syntax: {
    comment: string;
    variable: string;
    fn: string;
    io: string;
    loop: string;
    conditional: string;
  };
}

const py = `# Python 3 — PLInt
def greet(name: str) -> str:
    return f"Hello, {name}!"

for i in range(3):
    print(greet(f"world #{i}"))
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

const cs = `// C# — PLInt
using System;
class Program {
  static void Main() {
    for (int i = 0; i < 3; i++) Console.WriteLine($"Hello #{i}");
  }
}
`;

const php = `<?php
// PHP — PLInt
function greet($name) { return "Hello, $name!"; }
for ($i = 0; $i < 3; $i++) echo greet("world #$i") . "\\n";
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

const kt = `// Kotlin — PLInt
fun main() {
  (0 until 3).forEach { println("Hello #$it") }
}
`;

const rb = `# Ruby — PLInt
def greet(name) = "Hello, #{name}!"
3.times { |i| puts greet("world ##{i}") }
`;

const go = `// Go — PLInt
package main
import "fmt"
func main() {
  for i := 0; i < 3; i++ { fmt.Printf("Hello #%d\\n", i) }
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

const lua = `-- Lua — PLInt
local function greet(name) return "Hello, " .. name .. "!" end
for i = 0, 2 do print(greet("world #" .. i)) end
`;

const perl = `#!/usr/bin/perl
# Perl — PLInt
use strict; use warnings;
sub greet { my ($n) = @_; return "Hello, $n!"; }
for my $i (0..2) { print greet("world #$i"), "\\n"; }
`;

const r = `# R — PLInt
greet <- function(name) paste0("Hello, ", name, "!")
for (i in 0:2) cat(greet(paste0("world #", i)), "\\n")
`;

export const LANGUAGES: LanguageDef[] = [
  {
    id: "python", name: "Python", monaco: "python", runtime: "python",
    ext: ".py", sample: py,
    syntax: { comment: "# comment", variable: "x = 10", fn: "def f(x): ...", io: "print(x)", loop: "for i in range(n):", conditional: "if x > 0: ..." },
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
  {
    id: "java", name: "Java", monaco: "java", runtime: "server", serverId: "java",
    ext: ".java", sample: java,
    syntax: { comment: "// comment", variable: "int x = 10;", fn: "int f(int x) { ... }", io: "System.out.println(x);", loop: "for (int i = 0; i < n; i++)", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "csharp", name: "C#", monaco: "csharp", runtime: "server", serverId: "csharp",
    ext: ".cs", sample: cs,
    syntax: { comment: "// comment", variable: "int x = 10;", fn: "int F(int x) => ...;", io: "Console.WriteLine(x);", loop: "for (int i = 0; i < n; i++)", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "php", name: "PHP", monaco: "php", runtime: "php",
    ext: ".php", sample: php,
    syntax: { comment: "// comment", variable: "$x = 10;", fn: "function f($x) { ... }", io: "echo $x;", loop: "for ($i=0; $i<$n; $i++)", conditional: "if ($x > 0) { ... }" },
  },
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
  {
    id: "kotlin", name: "Kotlin", monaco: "kotlin", runtime: "server", serverId: "kotlin",
    ext: ".kt", sample: kt,
    syntax: { comment: "// comment", variable: "val x = 10", fn: "fun f(x: Int): Int = ...", io: "println(x)", loop: "for (i in 0 until n)", conditional: "if (x > 0) { ... }" },
  },
  {
    id: "ruby", name: "Ruby", monaco: "ruby", runtime: "ruby",
    ext: ".rb", sample: rb,
    syntax: { comment: "# comment", variable: "x = 10", fn: "def f(x) ... end", io: "puts x", loop: "n.times do |i| ... end", conditional: "if x > 0 then ... end" },
  },
  {
    id: "go", name: "Go", monaco: "go", runtime: "server", serverId: "go",
    ext: ".go", sample: go,
    syntax: { comment: "// comment", variable: "x := 10", fn: "func f(x int) int { ... }", io: "fmt.Println(x)", loop: "for i := 0; i < n; i++", conditional: "if x > 0 { ... }" },
  },
  {
    id: "dart", name: "Dart", monaco: "dart", runtime: "server", serverId: "dart",
    ext: ".dart", sample: dart,
    syntax: { comment: "// comment", variable: "var x = 10;", fn: "int f(int x) => ...;", io: "print(x);", loop: "for (var i = 0; i < n; i++)", conditional: "if (x > 0) { ... }" },
  },
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
    id: "lua", name: "Lua", monaco: "lua", runtime: "lua",
    ext: ".lua", sample: lua,
    syntax: { comment: "-- comment", variable: "local x = 10", fn: "function f(x) ... end", io: "print(x)", loop: "for i = 1, n do ... end", conditional: "if x > 0 then ... end" },
  },
];

export const LANG_BY_ID = Object.fromEntries(LANGUAGES.map((l) => [l.id, l]));
