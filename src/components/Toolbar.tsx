import { Files, Play, RotateCcw, Sliders, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { LanguageDef } from "@/lib/languages";

interface Props {
  language: LanguageDef;
  running: boolean;
  fileName?: string | null;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onRun: () => void;
  onReset: () => void;
  onOpenFiles: () => void;
  onOpenSettings: () => void;
}

export function Toolbar({
  language,
  running,
  fileName,
  sidebarCollapsed,
  onToggleSidebar,
  onRun,
  onReset,
  onOpenFiles,
  onOpenSettings,
}: Props) {
  return (
    <header className="relative flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            className="hidden rounded border border-border bg-surface-2/60 p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground md:inline-flex"
          >
            {sidebarCollapsed
              ? <PanelLeftOpen className="h-3.5 w-3.5" />
              : <PanelLeftClose className="h-3.5 w-3.5" />}
          </button>
        )}
        <div className="flex shrink-0 items-center gap-2">
          <span
            aria-hidden
            className="grid h-6 w-6 place-items-center rounded-[4px] border border-border bg-surface-2 font-mono text-[11px] text-primary"
          >
            $_
          </span>
          <div className="leading-tight">
            <div className="font-mono text-[13px] tracking-tight">
              <span className="text-muted-foreground">PL</span>
              <span className="text-foreground">Int</span>
            </div>
          </div>
        </div>
        <div className="ml-1 hidden min-w-0 items-center gap-2 border-l border-border pl-3 font-mono text-[11px] text-muted-foreground md:flex">
          <span className="text-primary">~</span>
          <span className="truncate">
            {fileName ? fileName : `main${language.ext}`}
          </span>
          <span className="opacity-40">·</span>
          <span className="truncate">{language.name}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <IconButton onClick={onOpenFiles} label="Files" icon={<Files className="h-3.5 w-3.5" />} />
        <IconButton onClick={onReset} label="Reset" icon={<RotateCcw className="h-3.5 w-3.5" />} />
        <IconButton
          onClick={onOpenSettings}
          label="Settings"
          icon={<Sliders className="h-3.5 w-3.5" />}
          hideLabelOnMobile
        />
        <button
          onClick={onRun}
          disabled={running}
          className="ml-1 inline-flex items-center gap-2 rounded-md border border-primary/60 bg-primary/10 px-3 py-1.5 font-mono text-xs text-primary hover:bg-primary/20 disabled:opacity-50"
        >
          {running ? (
            <>
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-primary" />
              <span className="hidden sm:inline">Running…</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3 fill-current" />
              <span>Run</span>
              <kbd className="ml-1 hidden rounded border border-primary/40 bg-primary/10 px-1 py-0.5 text-[9px] sm:inline">
                Ctrl+↵
              </kbd>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

function IconButton({
  onClick,
  label,
  icon,
  hideLabelOnMobile,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  hideLabelOnMobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2/60 px-2 py-1.5 font-mono text-[11px] text-muted-foreground hover:border-border/80 hover:bg-surface-2 hover:text-foreground sm:px-2.5"
    >
      {icon}
      <span className={hideLabelOnMobile ? "hidden md:inline" : "hidden sm:inline"}>
        {label}
      </span>
    </button>
  );
}
