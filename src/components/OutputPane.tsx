import type { RunResult } from "@/lib/runners";

interface Props {
  running: boolean;
  result: RunResult | null;
  onClear: () => void;
}

export function OutputPane({ running, result, onClear }: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Output
          </span>
          {running && <StatusBadge kind="running">running…</StatusBadge>}
          {!running && result && (
            <StatusBadge kind={result.ok ? "ok" : "err"}>
              {result.ok ? "success" : "error"} · {result.durationMs.toFixed(0)}ms
            </StatusBadge>
          )}
        </div>
        <button
          onClick={onClear}
          className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear
        </button>
      </div>

      <div className="scroll-slim flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed">
        {!result && !running && (
          <div className="text-muted-foreground">
            <span className="text-primary">▸</span> Press{" "}
            <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px]">
              ⌘/Ctrl + Enter
            </kbd>{" "}
            or click <span className="text-primary">Run</span> to execute your code.
          </div>
        )}

        {result?.diagnostics && result.diagnostics.length > 0 && (
          <div className="mb-3 space-y-1">
            {result.diagnostics.map((d, i) => (
              <div
                key={i}
                className={
                  "rounded border px-2 py-1 text-[12px] " +
                  (d.severity === "error"
                    ? "border-destructive/40 bg-destructive/10 text-destructive-foreground"
                    : d.severity === "warning"
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-border bg-surface-2 text-muted-foreground")
                }
              >
                <span className="uppercase tracking-wider text-[10px] opacity-70">
                  {d.severity}
                </span>{" "}
                {d.line && (
                  <span className="opacity-60">
                    [{d.line}
                    {d.column ? `:${d.column}` : ""}]{" "}
                  </span>
                )}
                <span className="whitespace-pre-wrap">{d.message}</span>
                {d.source && (
                  <span className="ml-2 text-[10px] opacity-50">— {d.source}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {result?.stdout && (
          <pre className="whitespace-pre-wrap text-foreground">{result.stdout}</pre>
        )}
        {result?.stderr && (
          <pre className="mt-2 whitespace-pre-wrap text-destructive">
            {result.stderr}
          </pre>
        )}
        {result && !result.stdout && !result.stderr && !result.diagnostics.length && (
          <div className="text-muted-foreground">(no output)</div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  kind,
  children,
}: {
  kind: "ok" | "err" | "running";
  children: React.ReactNode;
}) {
  const cls =
    kind === "ok"
      ? "border-success/40 bg-success/10 text-success"
      : kind === "err"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-primary/40 bg-primary/10 text-primary";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}
    >
      {kind === "running" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
