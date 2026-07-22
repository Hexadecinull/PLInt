export interface RunResult {
  stdout: string;
  stderr: string;
  /** Diagnostics from compilers/linters — errors and warnings. */
  diagnostics: Diagnostic[];
  /** Milliseconds to execute. */
  durationMs: number;
  /** True when execution completed without runtime error. */
  ok: boolean;
  /** Optional HTML preview payload (for HTML runtime). */
  html?: string;
}

export interface Diagnostic {
  severity: "error" | "warning" | "info";
  message: string;
  line?: number;
  column?: number;
  source?: string;
}

export const emptyResult = (): RunResult => ({
  stdout: "",
  stderr: "",
  diagnostics: [],
  durationMs: 0,
  ok: true,
});
