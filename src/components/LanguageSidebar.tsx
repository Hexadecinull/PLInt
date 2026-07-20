import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LANGUAGES, type LanguageDef } from "@/lib/languages";

interface Props {
  active: string;
  onSelect: (lang: LanguageDef) => void;
}

export function LanguageSidebar({ active, onSelect }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLang = LANGUAGES.find((l) => l.id === active);

  const list = (
    <nav className="scroll-slim flex-1 overflow-y-auto py-2">
      {LANGUAGES.map((l, i) => {
        const isActive = l.id === active;
        return (
          <button
            key={l.id}
            onClick={() => {
              onSelect(l);
              setMobileOpen(false);
            }}
            style={{ animationDelay: `${i * 15}ms` }}
            className={
              "group flex w-full animate-fade-in items-center gap-3 px-4 py-2 text-left text-sm transition-all hover:translate-x-0.5 " +
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
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-2 text-xs shadow-[var(--shadow-panel)] transition-transform hover:scale-105 md:hidden"
        aria-label="Open language picker"
      >
        <Menu className="h-4 w-4 text-primary" />
        <span className="font-mono">{activeLang?.name ?? "Languages"}</span>
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="border-b border-border px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Languages
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {LANGUAGES.length} available
          </div>
        </div>
        {list}
        <div className="border-t border-border px-4 py-3 text-[10px] leading-relaxed text-muted-foreground">
          Licensed under{" "}
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.html"
            target="_blank"
            rel="noreferrer"
            className="text-primary transition-colors hover:underline"
          >
            GPL-3.0
          </a>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex animate-fade-in md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="flex h-full w-64 animate-slide-in-right flex-col border-r border-border bg-surface"
            onClick={(e) => e.stopPropagation()}
            style={{ animationName: "slide-in-left" }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Languages
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
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
