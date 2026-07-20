import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getServerEndpoint, setServerEndpoint } from "@/lib/runners";
import { useSettings, type Settings } from "@/lib/settings";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ACCENTS: { id: Settings["accent"]; label: string; swatch: string }[] = [
  { id: "cyan", label: "Cyan", swatch: "oklch(0.78 0.16 190)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.72 0.18 295)" },
  { id: "amber", label: "Amber", swatch: "oklch(0.82 0.17 75)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.72 0.19 15)" },
  { id: "emerald", label: "Emerald", swatch: "oklch(0.76 0.17 160)" },
];

export function SettingsPanel({ open, onClose }: Props) {
  const [settings, update] = useSettings();
  const [endpoint, setEndpoint] = useState("");

  useEffect(() => {
    if (open) setEndpoint(getServerEndpoint());
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-popover shadow-[var(--shadow-panel)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scroll-slim max-h-[70vh] overflow-y-auto p-4">
          <Section title="Editor">
            <Row label={`Font size — ${settings.fontSize}px`}>
              <input
                type="range"
                min={10}
                max={22}
                value={settings.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </Row>
            <Row label={`Tab size — ${settings.tabSize}`}>
              <input
                type="range"
                min={2}
                max={8}
                step={2}
                value={settings.tabSize}
                onChange={(e) => update({ tabSize: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </Row>
            <Toggle
              label="Word wrap"
              checked={settings.wordWrap}
              onChange={(v) => update({ wordWrap: v })}
            />
            <Toggle
              label="Minimap"
              checked={settings.minimap}
              onChange={(v) => update({ minimap: v })}
            />
            <Toggle
              label="Line numbers"
              checked={settings.lineNumbers}
              onChange={(v) => update({ lineNumbers: v })}
            />
            <Toggle
              label="Font ligatures"
              checked={settings.ligatures}
              onChange={(v) => update({ ligatures: v })}
            />
          </Section>

          <Section title="Workspace">
            <Toggle
              label="Auto-save buffers"
              checked={settings.autoSave}
              onChange={(v) => update({ autoSave: v })}
            />
            <Row label="Accent">
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => update({ accent: a.id })}
                    aria-label={a.label}
                    className={
                      "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 " +
                      (settings.accent === a.id
                        ? "border-foreground"
                        : "border-transparent")
                    }
                    style={{ background: a.swatch }}
                  />
                ))}
              </div>
            </Row>
          </Section>

          <Section title="Server-side execution">
            <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
              Compiled and shell languages POST to this URL. Endpoint accepts{" "}
              <code className="font-mono">{`{ languageId, code }`}</code> and
              returns <code className="font-mono">{`{ stdout, stderr, ok }`}</code>.
            </p>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/api/execute"
              className="w-full rounded-md border border-border bg-input px-2 py-1.5 font-mono text-xs outline-none focus:border-primary"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => setServerEndpoint(endpoint)}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-transform hover:scale-105"
              >
                Save endpoint
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs text-foreground/80">{label}</div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-xs">
      <span className="text-foreground/80">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          "relative h-5 w-9 rounded-full border transition-colors " +
          (checked ? "border-primary bg-primary/40" : "border-border bg-surface-2")
        }
      >
        <span
          className={
            "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-foreground transition-all " +
            (checked ? "left-[18px] bg-primary" : "left-0.5")
          }
        />
      </button>
    </label>
  );
}
