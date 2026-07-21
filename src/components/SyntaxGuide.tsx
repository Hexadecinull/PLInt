import type { LanguageDef } from "@/lib/languages";

export function SyntaxGuide({ lang }: { lang: LanguageDef }) {
  const rows: Array<[string, string]> = [
    ["comment", lang.syntax.comment],
    ["variable", lang.syntax.variable],
    ["function", lang.syntax.fn],
    ["i/o", lang.syntax.io],
    ["loop", lang.syntax.loop],
    ["conditional", lang.syntax.conditional],
  ];
  return (
    <div className="scroll-slim h-full overflow-auto rounded-md border border-border bg-surface">
      <div className="border-b border-border px-3 py-1.5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          man {lang.name.toLowerCase()}
        </div>
      </div>
      <dl className="divide-y divide-border font-mono text-[11px]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[90px_1fr] gap-3 px-3 py-1.5">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-foreground/90">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
