import { LANGUAGES, type LanguageDef } from "@/lib/languages";

interface Props {
  active: string;
  onSelect: (lang: LanguageDef) => void;
}

export function LanguageSidebar({ active, onSelect }: Props) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Languages
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {LANGUAGES.length} available
        </div>
      </div>
      <nav className="scroll-slim flex-1 overflow-y-auto py-2">
        {LANGUAGES.map((l) => {
          const isActive = l.id === active;
          return (
            <button
              key={l.id}
              onClick={() => onSelect(l)}
              className={
                "group flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors " +
                (isActive
                  ? "bg-surface-2 text-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground")
              }
            >
              <span
                aria-hidden
                className={
                  "h-1.5 w-1.5 shrink-0 rounded-full transition-all " +
                  (isActive
                    ? "bg-primary shadow-[0_0_10px_var(--primary)]"
                    : "bg-surface-3 group-hover:bg-muted-foreground")
                }
              />
              <span className="flex-1 truncate">{l.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground/60">
                {l.ext}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-border px-4 py-3 text-[10px] leading-relaxed text-muted-foreground">
        Licensed under{" "}
        <a
          href="https://www.gnu.org/licenses/gpl-3.0.html"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          GPL-3.0
        </a>
      </div>
    </aside>
  );
}
