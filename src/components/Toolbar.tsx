import { useState } from "react";
import { getServerEndpoint, setServerEndpoint } from "@/lib/runners";
import type { LanguageDef } from "@/lib/languages";

interface Props {
  language: LanguageDef;
  running: boolean;
  onRun: () => void;
  onReset: () => void;
}

export function Toolbar({ language, running, onRun, onReset }: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const [endpoint, setEndpointState] = useState(() => getServerEndpoint());

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md" style={{ background: "var(--gradient-brand)" }}>
            <span className="text-[13px] font-black text-primary-foreground">P</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              PL<span className="brand-gradient-text">Int</span>
            </div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">
              programming language interpreter hub
            </div>
          </div>
        </div>
        <div className="ml-4 hidden items-center gap-2 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] text-muted-foreground md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-mono">main{language.ext}</span>
          <span className="opacity-40">·</span>
          <span>{language.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground"
        >
          Reset sample
        </button>
        <button
          onClick={() => setShowSettings((s) => !s)}
          aria-label="Settings"
          className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground"
        >
          ⚙︎
        </button>
        <button
          onClick={onRun}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "var(--gradient-brand)" }}
        >
          {running ? (
            <>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
              Running
            </>
          ) : (
            <>
              <span>▶</span> Run
              <kbd className="ml-1 rounded border border-primary-foreground/30 bg-primary-foreground/10 px-1 py-0.5 text-[9px] font-mono">
                ⌘↵
              </kbd>
            </>
          )}
        </button>
      </div>

      {showSettings && (
        <div
          className="absolute right-4 top-14 z-50 w-96 rounded-lg border border-border bg-popover p-4 shadow-[var(--shadow-panel)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 text-xs font-semibold">Server-side execution endpoint</div>
          <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
            Languages that can't run in the browser (Java, C#, Kotlin, Go, Dart, C,
            C++, Bash, PowerShell, Batch) POST to this URL. The endpoint must
            accept <code className="font-mono">{`{ languageId, code }`}</code> and
            return <code className="font-mono">{`{ stdout, stderr, ok }`}</code>.
          </p>
          <input
            type="url"
            value={endpoint}
            onChange={(e) => setEndpointState(e.target.value)}
            placeholder="/api/execute"
            className="w-full rounded-md border border-border bg-input px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setShowSettings(false)}
              className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setServerEndpoint(endpoint);
                setShowSettings(false);
              }}
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
