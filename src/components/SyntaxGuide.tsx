import type { LanguageDef } from "@/lib/languages";

export function SyntaxGuide({ lang }: { lang: LanguageDef }) {
  const rows: Array<[string, string]> = [
    ["Comment", lang.syntax.comment],
    ["Variable", lang.syntax.variable],
    ["Function", lang.syntax.fn],
    ["I/O", lang.syntax.io],
    ["Loop", lang.syntax.loop],
    ["Conditional", lang.syntax.conditional],
  ];
  return (
    <div className="scroll-slim h-full overflow-auto rounded-md border border-border bg-surface">
      <div className="border-b border-border px-3 py-1.5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          man {lang.name}
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
