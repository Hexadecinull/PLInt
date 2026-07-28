import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { LanguageDef } from "@/lib/languages";
import { useAnimatedOpen } from "@/hooks/use-animated-open";

interface Props {
  languages: LanguageDef[];
  active: string;
  onSelect: (lang: LanguageDef) => void;
}

export function LanguageSidebar({ languages, active, onSelect }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mounted, state } = useAnimatedOpen(mobileOpen);
  const activeLang = languages.find((l) => l.id === active);

  const list = (
    <nav className="scroll-slim flex-1 overflow-y-auto py-1">
      {languages.map((l) => {
        const isActive = l.id === active;
        const badge =
          l.group === "esoteric" ? "eso"
          : l.group === "assembly" ? "asm"
          : l.group === "weird" ? "weird"
          : null;
        return (
          <button
            key={l.id}
            onClick={() => {
              onSelect(l);
              setMobileOpen(false);
            }}
            className={
              "group flex w-full items-center gap-2 px-3 py-1.5 text-left font-mono text-[12px] " +
              (isActive
                ? "bg-surface-2 text-foreground"
                : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground")
            }
          >
            <span
              aria-hidden
              className={isActive ? "text-primary" : "text-muted-foreground/40"}
            >
              {isActive ? "›" : " "}
            </span>
            <span className="flex-1 truncate">{l.name}</span>
            {badge && (
              <span className="rounded border border-border/70 px-1 text-[9px] uppercase tracking-wider text-muted-foreground/70">
                {badge}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/50">{l.ext}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-[11px] shadow-[var(--shadow-panel)] md:hidden"
        aria-label="Open language picker"
      >
        <Menu className="h-3.5 w-3.5 text-primary" />
        <span>{activeLang?.name ?? "Languages"}</span>
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden h-full w-full shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="border-b border-border px-3 py-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Languages · {languages.length}
          </div>
        </div>
        {list}
        <div className="border-t border-border px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
          AGPL-3.0 ·{" "}
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.html"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            License
          </a>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mounted && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          onClick={() => setMobileOpen(false)}
          data-state={state}
          data-anim="overlay"
          style={{ background: "oklch(0 0 0 / 0.6)" }}
        >
          <aside
            className="flex h-full w-64 flex-col border-r border-border bg-surface"
            onClick={(e) => e.stopPropagation()}
            data-state={state}
            data-anim="drawer"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Languages
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="rounded p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {list}
          </aside>
          <div className="flex-1" />
        </div>
      )}
    </>
  );
}
