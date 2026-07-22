import type { LanguageDef } from "../languages";
import {
  runJs, runTs, runPython, runLua, runSql, runRuby, runPhp, runHtml, runBrainfuck,
} from "./browser";
import { runOnServer } from "./server";
import type { RunResult } from "./types";

export async function runCode(lang: LanguageDef, code: string): Promise<RunResult> {
  switch (lang.runtime) {
    case "js": return runJs(code);
    case "ts": return runTs(code);
    case "python": return runPython(code);
    case "lua": return runLua(code);
    case "sql": return runSql(code);
    case "ruby": return runRuby(code);
    case "php": return runPhp(code);
    case "html": return runHtml(code);
    case "brainfuck": return runBrainfuck(code);
    case "server": return runOnServer(lang.id, lang.serverId, code);
    default: return runOnServer(lang.id, lang.serverId, code);
  }
}

export { getServerEndpoint, setServerEndpoint } from "./server";
export type { RunResult } from "./types";
