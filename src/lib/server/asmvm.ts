// Shared simulator for every plain "asm()" catalog entry. Not a
// cycle-accurate emulator of real hardware, just one consistent
// pedagogical VM. See docs/ARCHITECTURE.md and docs/USAGE.md.
//
// Registers: r0-r7. Mnemonics:
//   mov d,s   add d,s   sub d,s   mul d,s   div d,s
//   cmp a,b   jmp L   je/jz L   jne/jnz L   jg L   jl L
//   push s    pop d    call L    ret
//   print r   prints "text"   halt

import type { EsoResult } from "./esoteric";

const ok = (stdout: string): EsoResult => ({ stdout, stderr: "", ok: true });
const fail = (stderr: string, stdout = ""): EsoResult => ({ stdout, stderr, ok: false });

export function runAsmVM(src: string): EsoResult {
  const rawLines = src.split("\n").map((l) => l.replace(/;.*$/, "").trim());
  const labels = new Map<string, number>();
  const lines: string[] = [];
  for (const l of rawLines) {
    const m = l.match(/^(\w+):\s*(.*)$/);
    if (m) {
      labels.set(m[1].toLowerCase(), lines.length);
      if (m[2]) lines.push(m[2]);
    } else if (l) {
      lines.push(l);
    }
  }

  const regs: Record<string, number> = {};
  for (let i = 0; i < 8; i++) regs[`r${i}`] = 0;
  let flagEq = false, flagGt = false, flagLt = false;
  const stack: number[] = [];
  const callStack: number[] = [];
  let out = "";

  const val = (tok: string): number => {
    if (tok === undefined) return 0;
    if (/^-?\d+$/.test(tok)) return parseInt(tok, 10);
    if (/^0x[0-9a-fA-F]+$/.test(tok)) return parseInt(tok, 16);
    return regs[tok.toLowerCase()] ?? 0;
  };
  const setReg = (name: string, v: number) => { if (name.toLowerCase() in regs) regs[name.toLowerCase()] = v | 0; };

  let pc = 0;
  let steps = 0;
  while (pc < lines.length) {
    if (++steps > 500_000) return fail("Step limit exceeded (possible infinite loop).", out);
    const line = lines[pc];
    const spaceIdx = line.search(/\s/);
    const op = (spaceIdx === -1 ? line : line.slice(0, spaceIdx)).toLowerCase();
    const rest = spaceIdx === -1 ? "" : line.slice(spaceIdx + 1).trim();
    const args = rest.length ? splitArgs(rest) : [];

    switch (op) {
      case "": break;
      case "mov": setReg(args[0], val(args[1])); break;
      case "add": setReg(args[0], val(args[0]) + val(args[1])); break;
      case "sub": setReg(args[0], val(args[0]) - val(args[1])); break;
      case "mul": setReg(args[0], val(args[0]) * val(args[1])); break;
      case "div": setReg(args[0], val(args[1]) === 0 ? 0 : Math.trunc(val(args[0]) / val(args[1]))); break;
      case "cmp": {
        const a = val(args[0]), b = val(args[1]);
        flagEq = a === b; flagGt = a > b; flagLt = a < b;
        break;
      }
      case "jmp": pc = labels.get(args[0]?.toLowerCase()) ?? lines.length; continue;
      case "je": case "jz": if (flagEq) { pc = labels.get(args[0]?.toLowerCase()) ?? lines.length; continue; } break;
      case "jne": case "jnz": if (!flagEq) { pc = labels.get(args[0]?.toLowerCase()) ?? lines.length; continue; } break;
      case "jg": if (flagGt) { pc = labels.get(args[0]?.toLowerCase()) ?? lines.length; continue; } break;
      case "jl": if (flagLt) { pc = labels.get(args[0]?.toLowerCase()) ?? lines.length; continue; } break;
      case "push": stack.push(val(args[0])); break;
      case "pop": setReg(args[0], stack.pop() ?? 0); break;
      case "call": callStack.push(pc + 1); pc = labels.get(args[0]?.toLowerCase()) ?? lines.length; continue;
      case "ret": pc = callStack.pop() ?? lines.length; continue;
      case "print": case "out": out += val(args[0]) + "\n"; break;
      case "prints": {
        const m = rest.match(/^"([\s\S]*)"$/);
        out += (m ? m[1] : rest) + "\n";
        break;
      }
      case "halt": case "hlt": pc = lines.length; continue;
      default: break; // unknown mnemonics are treated as no-ops
    }
    pc++;
  }
  return ok(out);
}

function splitArgs(rest: string): string[] {
  // Keep quoted strings intact when splitting on commas.
  const parts: string[] = [];
  let cur = "";
  let inQuote = false;
  for (const ch of rest) {
    if (ch === '"') inQuote = !inQuote;
    if (ch === "," && !inQuote) { parts.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}
