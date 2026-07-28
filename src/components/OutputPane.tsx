import type { RunResult } from "@/lib/runners";
import { useSettings } from "@/lib/settings";

interface Props {
  running: boolean;
  result: RunResult | null;
  onClear: () => void;
}

export function OutputPane({ running, result, onClear }: Props) {
  const [settings] = useSettings();
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-[oklch(0.10_0.005_240)] font-mono">
      {/* Terminal chrome */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-1.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            output — /bin/plint
          </span>
          {running && <StatusBadge kind="running">running</StatusBadge>}
          {!running && result && (
            <StatusBadge kind={result.ok ? "ok" : "err"}>
              {result.ok ? "exit 0" : "exit 1"} · {result.durationMs.toFixed(0)}ms
            </StatusBadge>
          )}
        </div>
        <button
          onClick={onClear}
          className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          clear
        </button>
      </div>

      {/* Optional rendered preview (HTML and Markdown runtimes) */}
      {result?.html !== undefined && (
        <div className="border-b border-border bg-white">
          <iframe
            title="Preview"
            srcDoc={result.html}
            sandbox="allow-scripts allow-modals allow-forms"
            className="h-56 w-full"
          />
        </div>
      )}

      <div
        className="scroll-slim flex-1 overflow-auto px-3 py-2 leading-relaxed"
        style={{ fontSize: `${settings.terminalFontSize}px` }}
      >
        {!result && !running && (
          <div className="text-terminal-dim">
            <span className="text-terminal-accent">user@plint</span>
            <span className="text-terminal-dim">:</span>
            <span className="text-primary">~</span>
            <span className="text-terminal-dim">$ </span>
            press{" "}
            <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[10px]">
              Ctrl + Enter
            </kbd>{" "}
            to run
            <span className="ml-1 inline-block h-[1em] w-[0.55em] translate-y-0.5 bg-terminal-fg/70 animate-caret" />
          </div>
        )}

        {(running || result) && (
          <div className="mb-1">
            <span className="text-terminal-accent">user@plint</span>
            <span className="text-terminal-dim">:</span>
            <span className="text-primary">~</span>
            <span className="text-terminal-dim">$ </span>
            <span className="text-terminal-fg/90">./run</span>
          </div>
        )}

        {result?.diagnostics && result.diagnostics.length > 0 && (
          <div className="mb-2 space-y-1">
            {result.diagnostics.map((d, i) => (
              <div
                key={i}
                className={
                  "border-l-2 pl-2 text-[12px] " +
                  (d.severity === "error"
                    ? "border-destructive text-destructive"
                    : d.severity === "warning"
                    ? "border-warning text-warning"
                    : "border-border text-terminal-dim")
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
          <pre className="whitespace-pre-wrap text-terminal-fg">{result.stdout}</pre>
        )}
        {result?.stderr && (
          <pre className="mt-1 whitespace-pre-wrap text-destructive">{result.stderr}</pre>
        )}
        {result && !result.stdout && !result.stderr && !result.diagnostics.length && !result.html && (
          <div className="text-terminal-dim">(no output)</div>
        )}

        {result && !running && (
          <div className="mt-2 text-terminal-dim">
            <span className="text-terminal-accent">user@plint</span>
            <span className="text-terminal-dim">:</span>
            <span className="text-primary">~</span>
            <span className="text-terminal-dim">$ </span>
            <span className="inline-block h-[1em] w-[0.55em] translate-y-0.5 bg-terminal-fg/70 animate-caret" />
          </div>
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
      ? "border-success/40 text-success"
      : kind === "err"
      ? "border-destructive/40 text-destructive"
      : "border-primary/40 text-primary";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}
    >
      {kind === "running" && (
        <span className="h-1.5 w-1.5 animate-blink rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
