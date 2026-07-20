import type { LanguageDef } from "@/lib/languages";

export function SyntaxGuide({ lang }: { lang: LanguageDef }) {
  const rows: Array<[string, string]> = [
    ["Comment", lang.syntax.comment],
    ["Variable", lang.syntax.variable],
    ["Function", lang.syntax.fn],
    ["Print / I/O", lang.syntax.io],
    ["Loop", lang.syntax.loop],
    ["Conditional", lang.syntax.conditional],
  ];
  return (
    <div className="scroll-slim h-full overflow-auto rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {lang.name} — syntax
        </div>
      </div>
      <dl className="divide-y divide-border text-[12px]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[110px_1fr] gap-3 px-4 py-2">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-mono text-foreground/90">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
