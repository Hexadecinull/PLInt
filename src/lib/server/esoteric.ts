// Esoteric-language interpreters. These run entirely in-process (no
// subprocess, no install) so they're free performance-wise — a good fit
// for a resource-limited box. Several of these languages don't have one
// canonical reference implementation; where the spec is genuinely
// ambiguous (Shakespeare's poetic values, INTERCAL's numeral tricks,
// Chicken's instruction mapping) this sticks to a documented, internally
// consistent subset rather than guessing at edge cases. See docs/USAGE.md.

export interface EsoResult {
  stdout: string;
  stderr: string;
  ok: boolean;
}

const ok = (stdout: string): EsoResult => ({ stdout, stderr: "", ok: true });
const fail = (stderr: string, stdout = ""): EsoResult => ({ stdout, stderr, ok: false });

// -------------------- Deadfish --------------------
export function runDeadfish(src: string): EsoResult {
  let x = 0;
  let out = "";
  for (const ch of src) {
    if (ch === "i") x++;
    else if (ch === "d") x--;
    else if (ch === "s") x = x * x;
    else if (ch === "o") out += x + "\n";
    if (x === -1 || x === 256) x = 0;
  }
  return ok(out);
}

// -------------------- Brainfuck core (shared by Ook!) --------------------
function runBrainfuckCore(src: string, stdin: string, cellCount = 30000, maxSteps = 5_000_000): EsoResult {
  const cells = new Uint8Array(cellCount);
  let ptr = 0;
  let out = "";
  let inPos = 0;
  const jumpTable = new Map<number, number>();
  const stack: number[] = [];
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "[") stack.push(i);
    else if (src[i] === "]") {
      const start = stack.pop();
      if (start === undefined) return fail("Unmatched ] in Brainfuck source.");
      jumpTable.set(start, i);
      jumpTable.set(i, start);
    }
  }
  if (stack.length) return fail("Unmatched [ in Brainfuck source.");

  let steps = 0;
  for (let i = 0; i < src.length; i++) {
    if (++steps > maxSteps) return fail("Step limit exceeded (possible infinite loop).", out);
    const c = src[i];
    if (c === ">") ptr = (ptr + 1) % cellCount;
    else if (c === "<") ptr = (ptr - 1 + cellCount) % cellCount;
    else if (c === "+") cells[ptr] = (cells[ptr] + 1) & 0xff;
    else if (c === "-") cells[ptr] = (cells[ptr] - 1) & 0xff;
    else if (c === ".") out += String.fromCharCode(cells[ptr]);
    else if (c === ",") cells[ptr] = inPos < stdin.length ? stdin.charCodeAt(inPos++) : 0;
    else if (c === "[") { if (cells[ptr] === 0) i = jumpTable.get(i)!; }
    else if (c === "]") { if (cells[ptr] !== 0) i = jumpTable.get(i)!; }
  }
  return ok(out);
}

// -------------------- Ook! (translates to Brainfuck) --------------------
export function runOok(src: string, stdin = ""): EsoResult {
  const tokens = src.match(/Ook[.!?]/g) ?? [];
  if (tokens.length % 2 !== 0) return fail("Ook! source has an odd number of tokens.");
  let bf = "";
  const map: Record<string, string> = {
    ".?": ">", "?.": "<", "..": "+", "!!": "-", "!.": ".", ".!": ",", "!?": "[", "?!": "]",
  };
  for (let i = 0; i < tokens.length; i += 2) {
    const a = tokens[i][3], b = tokens[i + 1][3];
    const op = map[a + b];
    if (!op) return fail(`Invalid Ook! pair at token ${i}.`);
    bf += op;
  }
  return runBrainfuckCore(bf, stdin);
}

// -------------------- Whitespace --------------------
export function runWhitespace(src: string, stdin = ""): EsoResult {
  const toks = [...src].filter((c) => c === " " || c === "\t" || c === "\n");
  let p = 0;
  const next = () => toks[p++];
  const readNumber = (): number => {
    const sign = next();
    let bits = "";
    while (true) {
      const t = next();
      if (t === "\n") break;
      bits += t === "\t" ? "1" : "0";
    }
    const mag = bits === "" ? 0 : parseInt(bits, 2);
    return sign === "\t" ? -mag : mag;
  };
  const readLabel = (): string => {
    let label = "";
    while (true) {
      const t = next();
      if (t === "\n") break;
      label += t;
    }
    return label;
  };

  // Pre-scan labels for flow control.
  const labels = new Map<string, number>();
  {
    let q = 0;
    while (q < toks.length) {
      if (toks[q] === "\n" && toks[q + 1] === " " && toks[q + 2] === " ") {
        const start = q;
        q += 3;
        let label = "";
        while (toks[q] !== "\n" && q < toks.length) label += toks[q++];
        q++;
        labels.set(label, start);
      } else {
        q++;
      }
    }
  }

  const stack: number[] = [];
  const heap = new Map<number, number>();
  const callStack: number[] = [];
  let out = "";
  let inPos = 0;
  let steps = 0;

  while (p < toks.length) {
    if (++steps > 2_000_000) return fail("Step limit exceeded (possible infinite loop).", out);
    const imp = next();
    if (imp === " ") {
      const cmd = next();
      if (cmd === " ") stack.push(readNumber());
      else if (cmd === "\n") {
        const c2 = next();
        if (c2 === " ") stack.push(stack[stack.length - 1]);
        else if (c2 === "\n") stack.pop();
        else if (c2 === "\t") { const n = readNumber(); const v = stack[stack.length - 1 - n]; stack.push(v); }
      } else if (cmd === "\t") {
        const c2 = next();
        if (c2 === " ") { const n = readNumber(); const top = stack.pop()!; stack.splice(Math.max(stack.length - n, 0), n); stack.push(top); }
        else if (c2 === "\n") { const b = stack.pop()!, a = stack.pop()!; stack.push(a, b); }
      }
    } else if (imp === "\t") {
      const g1 = next();
      if (g1 === " ") {
        const op1 = next(), op2 = next();
        const b = stack.pop()!, a = stack.pop()!;
        if (op1 === " " && op2 === " ") stack.push(a + b);
        else if (op1 === " " && op2 === "\t") stack.push(a - b);
        else if (op1 === " " && op2 === "\n") stack.push(a * b);
        else if (op1 === "\t" && op2 === " ") stack.push(Math.trunc(a / b));
        else if (op1 === "\t" && op2 === "\t") stack.push(((a % b) + b) % b);
      } else if (g1 === "\t") {
        const op = next();
        if (op === " ") { const v = stack.pop()!, addr = stack.pop()!; heap.set(addr, v); }
        else if (op === "\t") { const addr = stack.pop()!; stack.push(heap.get(addr) ?? 0); }
      } else if (g1 === "\n") {
        const op1 = next(), op2 = next();
        if (op1 === " " && op2 === " ") out += String.fromCharCode(stack.pop()!);
        else if (op1 === " " && op2 === "\t") out += String(stack.pop()!);
        else if (op1 === "\t" && op2 === " ") { const addr = stack.pop()!; heap.set(addr, inPos < stdin.length ? stdin.charCodeAt(inPos++) : 0); }
        else if (op1 === "\t" && op2 === "\t") { const addr = stack.pop()!; const line = stdin.slice(inPos).split("\n")[0] ?? ""; inPos += line.length + 1; heap.set(addr, parseInt(line, 10) || 0); }
      }
    } else if (imp === "\n") {
      const c1 = next();
      if (c1 === " ") {
        const c2 = next();
        if (c2 === " ") { readLabel(); }
        else if (c2 === "\t") { const label = readLabel(); callStack.push(p); p = labels.get(label) ?? toks.length; }
        else if (c2 === "\n") { const label = readLabel(); p = labels.get(label) ?? toks.length; }
      } else if (c1 === "\t") {
        const c2 = next();
        if (c2 === " ") { const label = readLabel(); if (stack.pop() === 0) p = labels.get(label) ?? toks.length; }
        else if (c2 === "\t") { const label = readLabel(); if ((stack.pop() ?? 0) < 0) p = labels.get(label) ?? toks.length; }
        else if (c2 === "\n") { p = callStack.pop() ?? toks.length; }
      } else if (c1 === "\n") {
        const c2 = next();
        if (c2 === "\n") break;
      }
    }
  }
  return ok(out);
}

// -------------------- Befunge-93 --------------------
export function runBefunge(src: string, stdin = ""): EsoResult {
  const lines = src.replace(/\r/g, "").split("\n");
  const H = Math.max(lines.length, 25), W = Math.max(...lines.map((l) => l.length), 80);
  const grid: string[][] = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x) => lines[y]?.[x] ?? " ")
  );
  let x = 0, y = 0, dx = 1, dy = 0;
  const stack: number[] = [];
  let out = "";
  let stringMode = false;
  let inPos = 0;
  let steps = 0;

  const pop = () => stack.pop() ?? 0;

  let halted = false;
  while (steps++ < 2_000_000) {
    const c = grid[y][x];
    if (stringMode) {
      if (c === '"') stringMode = false;
      else stack.push(c.charCodeAt(0));
    } else if (/[0-9]/.test(c)) stack.push(c.charCodeAt(0) - 48);
    else if (c === "+") { const b = pop(), a = pop(); stack.push(a + b); }
    else if (c === "-") { const b = pop(), a = pop(); stack.push(a - b); }
    else if (c === "*") { const b = pop(), a = pop(); stack.push(a * b); }
    else if (c === "/") { const b = pop(), a = pop(); stack.push(b === 0 ? 0 : Math.trunc(a / b)); }
    else if (c === "%") { const b = pop(), a = pop(); stack.push(b === 0 ? 0 : a % b); }
    else if (c === "!") stack.push(pop() === 0 ? 1 : 0);
    else if (c === "`") { const b = pop(), a = pop(); stack.push(a > b ? 1 : 0); }
    else if (c === ">") { dx = 1; dy = 0; }
    else if (c === "<") { dx = -1; dy = 0; }
    else if (c === "^") { dx = 0; dy = -1; }
    else if (c === "v") { dx = 0; dy = 1; }
    else if (c === "?") { const d = [[1,0],[-1,0],[0,1],[0,-1]][Math.floor(Math.random()*4)]; dx = d[0]; dy = d[1]; }
    else if (c === "_") { const v = pop(); dx = v === 0 ? 1 : -1; dy = 0; }
    else if (c === "|") { const v = pop(); dy = v === 0 ? 1 : -1; dx = 0; }
    else if (c === '"') stringMode = true;
    else if (c === ":") { const v = pop(); stack.push(v, v); }
    else if (c === "\\") { const b = pop(), a = pop(); stack.push(b, a); }
    else if (c === "$") pop();
    else if (c === ".") out += pop() + " ";
    else if (c === ",") out += String.fromCharCode(pop());
    else if (c === "#") { x = (x + dx + W) % W; y = (y + dy + H) % H; }
    else if (c === "p") { const py = pop(), px = pop(), v = pop(); if (grid[py]) grid[py][px] = String.fromCharCode(v); }
    else if (c === "g") { const gy = pop(), gx = pop(); stack.push(grid[gy]?.[gx]?.charCodeAt(0) ?? 0); }
    else if (c === "&") { const m = stdin.slice(inPos).match(/-?\d+/); stack.push(m ? parseInt(m[0], 10) : 0); inPos += m ? (m.index ?? 0) + m[0].length : 0; }
    else if (c === "~") { stack.push(inPos < stdin.length ? stdin.charCodeAt(inPos++) : -1); }
    else if (c === "@") { halted = true; break; }

    x = (x + dx + W) % W;
    y = (y + dy + H) % H;
    if (c === "@") { halted = true; break; }
  }
  if (!halted) return fail("Step limit exceeded (possible infinite loop — no @ reached).", out);
  return ok(out);
}

// -------------------- Binary --------------------
export function runBinary(src: string): EsoResult {
  const bytes = src.split(/[^01]+/).filter((b) => b.length > 0);
  let out = "";
  for (const b of bytes) {
    out += String.fromCharCode(parseInt(b.padEnd(8, "0").slice(0, 8), 2));
  }
  return ok(out);
}

// -------------------- Chicken (best-effort — see docs/USAGE.md) --------------------
export function runChicken(src: string): EsoResult {
  const lines = src.split("\n").map((l) => (l.match(/chicken/gi) ?? []).length).filter((n) => n > 0);
  const stack: number[] = [];
  let out = "";
  for (const n of lines) {
    const op = n % 6;
    if (op === 1) stack.push(0);
    else if (op === 2) stack.push((stack.pop() ?? 0) + 1);
    else if (op === 3) out += String.fromCharCode((stack.pop() ?? 0) % 256);
    else if (op === 4) out += String(stack.pop() ?? 0);
    else if (op === 5) stack.push(stack[stack.length - 1] ?? 0);
  }
  return ok(out || `(${lines.length} chicken-instructions executed, no output opcode reached)\n`);
}

// -------------------- ArnoldC (common subset) --------------------
export function runArnoldC(src: string): EsoResult {
  const lines = src.split("\n").map((l) => l.trim()).filter(Boolean);
  const vars = new Map<string, number | string>();
  let out = "";
  let started = false;
  for (const line of lines) {
    if (/^IT'S SHOWTIME/i.test(line)) { started = true; continue; }
    if (/^YOU HAVE BEEN TERMINATED/i.test(line)) break;
    if (!started) continue;
    let m = line.match(/^TALK TO THE HAND "(.*)"$/);
    if (m) { out += m[1] + "\n"; continue; }
    m = line.match(/^TALK TO THE HAND (\w+)$/);
    if (m) { out += String(vars.get(m[1]) ?? "") + "\n"; continue; }
    m = line.match(/^HEY CHRISTMAS TREE (\w+)$/);
    if (m) { vars.set(m[1], 0); continue; }
    m = line.match(/^YOU SET US UP (-?\d+)$/);
    if (m) {
      const lastVar = [...vars.keys()].pop();
      if (lastVar) vars.set(lastVar, parseInt(m[1], 10));
      continue;
    }
  }
  if (!started) return fail("Missing \"IT'S SHOWTIME\" — every ArnoldC program needs one.");
  return ok(out);
}

// -------------------- Rockstar (common subset) --------------------
function poeticNumber(words: string[]): number {
  const digits = words.map((w) => String(w.replace(/[^a-zA-Z']/g, "").length % 10));
  return parseInt(digits.join("") || "0", 10);
}

export function runRockstar(src: string): EsoResult {
  const vars = new Map<string, number | string>();
  let out = "";
  const lines = src.split("\n").map((l) => l.trimEnd());

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    let m = line.match(/^(.+?)\s+(?:was|is|were)\s+(.+?)\.?$/i);
    if (m && !/^(shout|say|scream|whisper|listen|put|if|while|until)\b/i.test(line)) {
      const name = m[1].trim();
      const rhs = m[2].trim();
      if (/^-?\d+(\.\d+)?$/.test(rhs)) vars.set(name, parseFloat(rhs));
      else if (/^".*"$/.test(rhs)) vars.set(name, rhs.slice(1, -1));
      else vars.set(name, poeticNumber(rhs.replace(/[.!?]$/, "").split(/\s+/)));
      continue;
    }

    m = line.match(/^(?:Shout|Say|Scream|Whisper)\s+(.+?)\.?$/i);
    if (m) {
      const key = m[1].trim();
      const v = vars.has(key) ? vars.get(key) : (/^-?\d+(\.\d+)?$/.test(key) ? parseFloat(key) : key.replace(/^"|"$/g, ""));
      out += String(v) + "\n";
      continue;
    }

    m = line.match(/^Put\s+(.+?)\s+into\s+(.+?)\.?$/i);
    if (m) {
      const valTok = m[1].trim();
      const v = vars.has(valTok) ? vars.get(valTok)! : (/^-?\d+(\.\d+)?$/.test(valTok) ? parseFloat(valTok) : valTok);
      vars.set(m[2].trim(), v);
      continue;
    }
  }
  return ok(out);
}

// -------------------- LOLCODE --------------------
export function runLolcode(src: string): EsoResult {
  const lines = src.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("BTW"));
  const vars = new Map<string, number | string>();
  let out = "";

  const tokenize = (line: string): string[] => {
    const toks: string[] = [];
    const re = /"[^"]*"|\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) toks.push(m[0]);
    return toks;
  };

  const valueOf = (tok: string): number | string => {
    if (/^".*"$/.test(tok)) return tok.slice(1, -1);
    if (/^-?\d+(\.\d+)?$/.test(tok)) return parseFloat(tok);
    if (vars.has(tok)) return vars.get(tok)!;
    return 0;
  };
  const num = (v: number | string) => (typeof v === "number" ? v : parseFloat(v) || 0);

  let toks: string[] = [];
  let ti = 0;
  function parseExpr(): number | string {
    const t = toks[ti++];
    if (t === undefined) return 0;
    const upper = t.toUpperCase();
    const binOp = (fn: (a: number, b: number) => number) => {
      if (toks[ti]?.toUpperCase() === "OF") ti++;
      const a = parseExpr();
      if (toks[ti]?.toUpperCase() === "AN") ti++;
      const b = parseExpr();
      return fn(num(a), num(b));
    };
    switch (upper) {
      case "SUM": return binOp((a, b) => a + b);
      case "DIFF": return binOp((a, b) => a - b);
      case "PRODUKT": return binOp((a, b) => a * b);
      case "QUOSHUNT": return binOp((a, b) => (b === 0 ? 0 : a / b));
      case "MOD": return binOp((a, b) => (b === 0 ? 0 : a % b));
      case "BIGGR": return binOp((a, b) => Math.max(a, b));
      case "SMALLR": return binOp((a, b) => Math.min(a, b));
      case "BOTH": {
        if (toks[ti]?.toUpperCase() === "SAEM") {
          ti++;
          if (toks[ti]?.toUpperCase() === "OF") ti++;
          const a = parseExpr();
          if (toks[ti]?.toUpperCase() === "AN") ti++;
          const b = parseExpr();
          return a === b || num(a) === num(b) ? 1 : 0;
        }
        return binOp((a, b) => (a && b ? 1 : 0));
      }
      case "DIFFRINT": {
        if (toks[ti]?.toUpperCase() === "OF") ti++;
        const a = parseExpr();
        if (toks[ti]?.toUpperCase() === "AN") ti++;
        const b = parseExpr();
        return a !== b ? 1 : 0;
      }
      case "NOT": return num(parseExpr()) ? 0 : 1;
      case "SMOOSH": {
        let s = "";
        while (ti < toks.length && toks[ti].toUpperCase() !== "MKAY") {
          if (toks[ti].toUpperCase() === "AN") { ti++; continue; }
          s += String(parseExpr());
        }
        if (toks[ti]?.toUpperCase() === "MKAY") ti++;
        return s;
      }
      default:
        return valueOf(t);
    }
  }

  const tokenizeCache = new Map<number, string[]>();
  const tokLine = (idx: number): string[] => {
    if (!tokenizeCache.has(idx)) tokenizeCache.set(idx, tokenize(lines[idx] ?? ""));
    return tokenizeCache.get(idx)!;
  };

  const execLine = (idx: number) => {
    toks = tokLine(idx);
    ti = 0;
    const h = toks[0]?.toUpperCase();
    if (h === "VISIBLE") {
      ti = 1;
      const parts: string[] = [];
      while (ti < toks.length) parts.push(String(parseExpr()));
      out += parts.join("") + "\n";
    } else if (h === "I" && toks[1]?.toUpperCase() === "HAS" && toks[2]?.toUpperCase() === "A") {
      const name = toks[3];
      let val: number | string = 0;
      if (toks[4]?.toUpperCase() === "ITZ") { ti = 5; val = parseExpr(); }
      vars.set(name, val);
    } else if (toks[1]?.toUpperCase() === "R") {
      ti = 2; vars.set(toks[0], parseExpr());
    }
  };

  let i = 0;
  let guardTotal = 0;
  while (i < lines.length) {
    if (++guardTotal > 2_000_000) return fail("Step limit exceeded (possible infinite loop).", out);
    toks = tokLine(i);
    ti = 0;
    const head = toks[0]?.toUpperCase();

    if (head === "HAI") { i++; continue; }
    if (head === "KTHXBYE") break;

    if (head === "IM" && toks[1]?.toUpperCase() === "IN" && toks[2]?.toUpperCase() === "YR") {
      const label = toks[3];
      let end = -1;
      for (let j = i + 1; j < lines.length; j++) {
        const lt = tokLine(j);
        if (lt[0]?.toUpperCase() === "IM" && lt[1]?.toUpperCase() === "OUTTA" && lt[3] === label) { end = j; break; }
      }
      if (end === -1) return fail(`Loop "${label}" has no matching IM OUTTA YR.`, out);

      let cursor = 4;
      let opWord = "";
      if (toks[cursor]?.toUpperCase() === "UPPIN" || toks[cursor]?.toUpperCase() === "NERFIN") {
        opWord = toks[cursor].toUpperCase();
        cursor += 1;
        if (toks[cursor]?.toUpperCase() === "YR") cursor += 1;
      }
      const varName = toks[cursor];
      cursor += 1;
      let condType = "";
      if (toks[cursor]?.toUpperCase() === "WILE" || toks[cursor]?.toUpperCase() === "TIL") {
        condType = toks[cursor].toUpperCase();
        cursor += 1;
      }
      const condStart = cursor;

      const evalCond = (): boolean => {
        if (!condType) return true;
        toks = tokLine(i);
        ti = condStart;
        const v = num(parseExpr());
        return condType === "WILE" ? !!v : !v;
      };

      let guard = 0;
      while (evalCond() && guard++ < 1_000_000) {
        for (let j = i + 1; j < end; j++) execLine(j);
        if (opWord === "UPPIN") vars.set(varName, num(valueOf(varName)) + 1);
        else if (opWord === "NERFIN") vars.set(varName, num(valueOf(varName)) - 1);
      }
      i = end + 1;
      continue;
    }

    execLine(i);
    i++;
  }

  return ok(out);
}

// -------------------- Shakespeare (best-effort — see docs/USAGE.md) --------------------
export function runShakespeare(src: string): EsoResult {
  const lines = src.split("\n");
  const characters = new Set<string>();
  const values = new Map<string, number>();
  let onStage: string[] = [];
  let out = "";

  const declRe = /^([A-Z][a-zA-Z ]*?),/;
  for (const line of lines.slice(0, 30)) {
    const m = line.match(declRe);
    if (m && /\ba\b|\ban\b/.test(line)) { characters.add(m[1].trim()); values.set(m[1].trim(), 0); }
  }
  if (characters.size === 0) return fail("No character declarations found.");

  const poeticValue = (phrase: string): number => {
    const words = phrase.replace(/[.!?]/g, "").split(/\s+/).filter((w) => !/^(a|an|the)$/i.test(w));
    if (words.length === 0) return 1;
    if (/^(nothing|zero|nought)$/i.test(words[words.length - 1])) return 0;
    return Math.pow(2, Math.max(words.length - 1, 0));
  };

  let currentSpeaker: string | null = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const enter = line.match(/^\[Enter (.+)\]$/i);
    if (enter) { onStage = enter[1].split(/,| and /i).map((s) => s.trim()).filter(Boolean); continue; }
    if (/^\[Exeunt/i.test(line)) { onStage = []; continue; }

    const speaker = line.match(/^([A-Z][a-zA-Z ]*?):$/);
    if (speaker && characters.has(speaker[1])) { currentSpeaker = speaker[1]; continue; }

    if (!currentSpeaker) continue;
    const other = onStage.find((c) => c !== currentSpeaker) ?? [...characters].find((c) => c !== currentSpeaker);
    if (!other) continue;

    for (const sentence of line.split(/(?<=[.!?])\s+/)) {
      const s = sentence.trim();
      if (!s) continue;
      const asAs = s.match(/^You are as (.+?) as (.+)$/i);
      const plain = s.match(/^You are (.+)$/i);
      if (asAs || plain) {
        values.set(other, poeticValue(asAs ? asAs[2] : plain![1]));
        continue;
      }
      if (/^Speak your mind/i.test(s) || /^Open your heart/i.test(s)) {
        const code = ((values.get(other) ?? 0) % 0x10ffff + 0x10ffff) % 0x10ffff;
        out += String.fromCharCode(code || 32);
        continue;
      }
      if (/^Open your mind/i.test(s)) { out += String(values.get(other) ?? 0); continue; }
    }
  }
  return ok(out || "(no output — see docs/USAGE.md for the supported Shakespeare subset)\n");
}

// -------------------- INTERCAL (best-effort subset — see docs/USAGE.md) --------------------
export function runIntercal(src: string): EsoResult {
  const arrays = new Map<string, number[]>();
  let out = "";
  const lines = src.split("\n").map((l) => l.replace(/^(PLEASE\s+)?(DO\s+)?/i, "").trim()).filter(Boolean);

  for (const line of lines) {
    if (/^GIVE UP/i.test(line)) break;

    let m = line.match(/^,(\d+)\s*<-\s*#(\d+)$/);
    if (m) { arrays.set(m[1], new Array(parseInt(m[2], 10)).fill(0)); continue; }

    m = line.match(/^,(\d+)\s+SUB\s+#(\d+)\s*<-\s*#(\d+)$/);
    if (m) { const arr = arrays.get(m[1]); if (arr) arr[parseInt(m[2], 10) - 1] = parseInt(m[3], 10); continue; }

    m = line.match(/^READ OUT\s+,(\d+)$/);
    if (m) { const arr = arrays.get(m[1]) ?? []; out += arr.map((v) => String.fromCharCode(v & 0xff)).join(""); continue; }
  }
  return ok(out);
}

// -------------------- Chef (core subset — see docs/USAGE.md) --------------------
export function runChef(src: string): EsoResult {
  const lines = src.split("\n");
  const ingredients = new Map<string, number>();
  const liquefied = new Set<string>();
  let bowl: { name: string; value: number }[] = [];
  let dish: { name: string; value: number }[] = [];
  let servesN = 1;
  let inIngredients = false, inMethod = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (/^Ingredients\.?$/i.test(line)) { inIngredients = true; inMethod = false; continue; }
    if (/^Method\.?$/i.test(line)) { inIngredients = false; inMethod = true; continue; }

    if (inIngredients) {
      const m = line.match(/^(\d+)\s*(?:g|ml|kg|l|dashes?|cups?)?\s+(.+)$/i);
      if (m) ingredients.set(m[2].trim(), parseInt(m[1], 10));
      continue;
    }

    if (inMethod) {
      let m = line.match(/^Put (?:the )?(.+?) into (?:the )?mixing bowl\.?$/i);
      if (m) { const name = m[1].trim(); bowl.push({ name, value: ingredients.get(name) ?? 0 }); continue; }

      m = line.match(/^Liquefy (?:contents of the |the )?mixing bowl\.?$/i);
      if (m) { for (const b of bowl) liquefied.add(b.name); continue; }
      m = line.match(/^Liquefy (?:the )?(.+?)\.?$/i);
      if (m && ingredients.has(m[1].trim())) { liquefied.add(m[1].trim()); continue; }

      m = line.match(/^Pour (?:contents of the |the )?mixing bowl into (?:the )?(?:\d+\w* )?baking dish\.?$/i);
      if (m) { dish = dish.concat(bowl); continue; }

      m = line.match(/^Serves (\d+)\.?$/i);
      if (m) { servesN = parseInt(m[1], 10); continue; }
    }
  }

  const top = dish.slice(-servesN).reverse();
  let out = "";
  for (const item of top) out += liquefied.has(item.name) ? String.fromCharCode(item.value & 0xff) : String(item.value);
  return ok(out);
}

// -------------------- Piet / Malbolge — not executable here --------------------
export function pietMessage(): EsoResult {
  return fail(
    "Piet programs are 2D images (colored codels), not text — PLInt can't execute image source. " +
      "Use a dedicated Piet interpreter (e.g. npiet) locally with your PNG."
  );
}

export function malbolgeMessage(variant: "malbolge" | "malbolge-u"): EsoResult {
  return fail(
    `${variant === "malbolge" ? "Malbolge" : "Malbolge Unshackled"} isn't executed in-app — its ` +
      "encryption/rotation tables are too easy to get subtly wrong without a reference implementation " +
      "to check against, and a wrong answer here would be worse than none. Install a dedicated " +
      `${variant === "malbolge" ? "malbolge" : "malbolge-unshackled"} interpreter on the server and PLInt ` +
      "will use it automatically if it's on PATH."
  );
}
