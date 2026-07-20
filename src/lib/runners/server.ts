// Server-backed runner. The client POSTs to a configurable endpoint that
// the operator wires up on their own infrastructure. This keeps PLInt fully
// online but lets languages that require compilers/interpreters (Java, C#,
// Kotlin, Go, Dart, C, C++, Bash, PowerShell, Batch) execute on the server.
//
// Expected request body:
//   { languageId: string, code: string, stdin?: string }
// Expected response body (JSON):
//   { stdout: string, stderr: string, ok: boolean,
//     diagnostics?: { severity, message, line?, column?, source? }[],
//     durationMs?: number }

import type { RunResult } from "./types";
import { emptyResult } from "./types";

const ENDPOINT_KEY = "plint.executeEndpoint";

export function getServerEndpoint(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ENDPOINT_KEY) ?? "/api/execute";
}

export function setServerEndpoint(url: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ENDPOINT_KEY, url);
}

export async function runOnServer(
  languageId: string,
  serverId: string | undefined,
  code: string
): Promise<RunResult> {
  const res = emptyResult();
  const start = performance.now();
  const endpoint = getServerEndpoint();
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languageId, language: serverId ?? languageId, code }),
    });
    if (!r.ok) {
      res.ok = false;
      res.stderr =
        `Server runner returned HTTP ${r.status} at ${endpoint}\n\n` +
        `This language runs on a server-side interpreter/compiler.\n` +
        `Configure your execution endpoint in the toolbar (⚙︎) once your ` +
        `self-hosted runner is deployed. It should accept POST { languageId, code } ` +
        `and return { stdout, stderr, ok }.`;
      return res;
    }
    const body = await r.json();
    res.stdout = body.stdout ?? "";
    res.stderr = body.stderr ?? "";
    res.ok = Boolean(body.ok);
    res.diagnostics = body.diagnostics ?? [];
    res.durationMs = body.durationMs ?? performance.now() - start;
    return res;
  } catch (e) {
    res.ok = false;
    res.stderr =
      `Could not reach execution endpoint (${endpoint}).\n` +
      `${(e as Error).message}\n\n` +
      `This language needs a server-side runner. Wire up your own executor ` +
      `and set the endpoint in the toolbar settings.`;
    res.durationMs = performance.now() - start;
    return res;
  }
}
