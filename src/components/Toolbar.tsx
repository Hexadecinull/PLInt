import { Files, Play, RotateCcw, Settings2 } from "lucide-react";
import type { LanguageDef } from "@/lib/languages";

interface Props {
  language: LanguageDef;
  running: boolean;
  fileName?: string | null;
  onRun: () => void;
  onReset: () => void;
  onOpenFiles: () => void;
  onOpenSettings: () => void;
}

export function Toolbar({
  language,
  running,
  fileName,
  onRun,
  onReset,
  onOpenFiles,
  onOpenSettings,
}: Props) {
  return (
    <header className="relative flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <div
            className="grid h-7 w-7 place-items-center rounded-md transition-transform hover:scale-110"
            style={{ background: "var(--gradient-brand)" }}
          >
            <span className="text-[13px] font-black text-primary-foreground">P</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              PL<span className="brand-gradient-text">Int</span>
            </div>
            <div className="hidden text-[10px] text-muted-foreground -mt-0.5 sm:block">
              programming language interpreter hub
            </div>
          </div>
        </div>
        <div className="ml-2 hidden min-w-0 items-center gap-2 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] text-muted-foreground md:flex">
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
          <span className="truncate font-mono">
            {fileName ? fileName : `main${language.ext}`}
          </span>
          <span className="opacity-40">·</span>
          <span className="truncate">{language.name}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenFiles}
          aria-label="Files"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-xs text-muted-foreground transition-all hover:scale-105 hover:bg-surface-3 hover:text-foreground sm:px-3"
        >
          <Files className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Files</span>
        </button>
        <button
          onClick={onReset}
          aria-label="Reset sample"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-xs text-muted-foreground transition-all hover:scale-105 hover:bg-surface-3 hover:text-foreground sm:px-3"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="rounded-md border border-border bg-surface-2 p-1.5 text-muted-foreground transition-all hover:rotate-45 hover:bg-surface-3 hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRun}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 sm:px-4"
          style={{ background: "var(--gradient-brand)" }}
        >
          {running ? (
            <>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
              <span className="hidden sm:inline">Running</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3 fill-current" />
              <span>Run</span>
              <kbd className="ml-1 hidden rounded border border-primary-foreground/30 bg-primary-foreground/10 px-1 py-0.5 text-[9px] font-mono sm:inline">
                ⌘↵
              </kbd>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
