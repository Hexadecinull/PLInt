import { useEffect, useRef, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { getServerEndpoint, setServerEndpoint } from "@/lib/runners";
import { useSettings, type Settings } from "@/lib/settings";
import { useAnimatedOpen } from "@/hooks/use-animated-open";
import { WEIRD, ESOTERIC, ASSEMBLY, type LanguageDef } from "@/lib/languages";
import { useSecretState, toggleSecretLanguage, setSecretState } from "@/lib/secret";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ACCENTS: { id: Settings["accent"]; label: string; swatch: string }[] = [
  { id: "cyan", label: "Cyan", swatch: "oklch(0.82 0.14 185)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.74 0.15 295)" },
  { id: "amber", label: "Amber", swatch: "oklch(0.84 0.15 80)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.74 0.16 15)" },
  { id: "emerald", label: "Emerald", swatch: "oklch(0.78 0.15 155)" },
  { id: "mono", label: "Mono", swatch: "oklch(0.92 0.005 240)" },
];

export function SettingsPanel({ open, onClose }: Props) {
  const [settings, update] = useSettings();
  const [endpoint, setEndpoint] = useState("");
  const { mounted, state } = useAnimatedOpen(open);
  const [secret] = useSecretState();
  const [showSecret, setShowSecret] = useState(false);
  const [bounceKey, setBounceKey] = useState(0);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) setEndpoint(getServerEndpoint());
  }, [open]);

  useEffect(() => {
    if (!open) {
      setShowSecret(false);
      clickCountRef.current = 0;
    }
  }, [open]);

  if (!mounted) return null;

  const onGearClick = () => {
    setBounceKey((k) => k + 1);
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 2000);
    if (clickCountRef.current >= 10) {
      clickCountRef.current = 0;
      setSecretState({ unlocked: true });
      setShowSecret(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
      data-state={state}
      data-anim="overlay"
      style={{ background: "oklch(0 0 0 / 0.55)" }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-md border border-border bg-popover shadow-[var(--shadow-panel)] md:max-w-3xl"
        onClick={(e) => e.stopPropagation()}
        data-state={state}
        data-anim="panel"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {showAbout ? "~/Settings/about" : showSecret ? "~/Settings/secret" : "~/Settings"}
          </h2>

          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scroll-slim max-h-[72vh] overflow-y-auto p-4 md:p-6">
          {showSecret ? (
            <SecretMenu enabled={secret.enabled} onBack={() => setShowSecret(false)} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Section title="Appearance">
                  <Segmented
                    label="Theme"
                    value={settings.theme}
                    options={[
                      { id: "dark", label: "Dark" },
                      { id: "light", label: "Light" },
                    ]}
                    onChange={(v) => update({ theme: v as Settings["theme"] })}
                  />
                  <Row label="Accent">
                    <div className="flex flex-wrap gap-2">
                      {ACCENTS.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => update({ accent: a.id })}
                          aria-label={a.label}
                          title={a.label}
                          className={
                            "h-6 w-6 rounded-full border-2 " +
                            (settings.accent === a.id ? "border-foreground" : "border-transparent")
                          }
                          style={{ background: a.swatch }}
                        />
                      ))}
                    </div>
                  </Row>
                  <Toggle
                    label="Deeper accent (tint the whole UI)"
                    checked={settings.deepAccent}
                    onChange={(v) => update({ deepAccent: v })}
                  />
                  <Segmented
                    label="Density"
                    value={settings.density}
                    options={[
                      { id: "comfortable", label: "Comfortable" },
                      { id: "compact", label: "Compact" },
                    ]}
                    onChange={(v) => update({ density: v as Settings["density"] })}
                  />
                  <Toggle label="Reduced motion" checked={settings.reducedMotion} onChange={(v) => update({ reducedMotion: v })} />
                </Section>

                <Section title="Editor">
                  <Row label={`Font size — ${settings.fontSize}px`}>
                    <input
                      type="range" min={10} max={22} value={settings.fontSize}
                      onChange={(e) => update({ fontSize: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </Row>
                  <Row label={`Tab size — ${settings.tabSize}`}>
                    <input
                      type="range" min={2} max={8} step={2} value={settings.tabSize}
                      onChange={(e) => update({ tabSize: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </Row>
                  <Segmented
                    label="Cursor style"
                    value={settings.cursorStyle}
                    options={[
                      { id: "line", label: "Line" },
                      { id: "block", label: "Block" },
                      { id: "underline", label: "Underline" },
                    ]}
                    onChange={(v) => update({ cursorStyle: v as Settings["cursorStyle"] })}
                  />
                  <Segmented
                    label="Cursor blinking"
                    value={settings.cursorBlinking}
                    options={[
                      { id: "blink", label: "Blink" },
                      { id: "smooth", label: "Smooth" },
                      { id: "solid", label: "Solid" },
                    ]}
                    onChange={(v) => update({ cursorBlinking: v as Settings["cursorBlinking"] })}
                  />
                  <Toggle label="Word wrap" checked={settings.wordWrap} onChange={(v) => update({ wordWrap: v })} />
                  <Toggle label="Minimap" checked={settings.minimap} onChange={(v) => update({ minimap: v })} />
                  <Toggle label="Line numbers" checked={settings.lineNumbers} onChange={(v) => update({ lineNumbers: v })} />
                  <Toggle label="Font ligatures" checked={settings.ligatures} onChange={(v) => update({ ligatures: v })} />
                  <Toggle label="Indent guides" checked={settings.indentGuides} onChange={(v) => update({ indentGuides: v })} />
                  <Toggle label="Bracket pair colorization" checked={settings.bracketColorization} onChange={(v) => update({ bracketColorization: v })} />
                  <Toggle label="Sticky scroll" checked={settings.stickyScroll} onChange={(v) => update({ stickyScroll: v })} />
                  <Toggle label="Show whitespace" checked={settings.showWhitespace} onChange={(v) => update({ showWhitespace: v })} />
                </Section>
              </div>

              <div>
                <Section title="Workspace">
                  <Toggle label="Auto-save buffers" checked={settings.autoSave} onChange={(v) => update({ autoSave: v })} />
                </Section>

                <Section title="Server-side execution">
                  <p className="mb-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                    Compiled and shell languages POST to this URL. Endpoint accepts{" "}
                    <code>{`{ languageId, code }`}</code> and returns{" "}
                    <code>{`{ stdout, stderr, ok }`}</code>.
                  </p>
                  <input
                    type="url" value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/api/execute"
                    className="w-full rounded-md border border-border bg-input px-2 py-1.5 font-mono text-xs outline-none focus:border-primary"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => setServerEndpoint(endpoint)}
                      className="rounded-md border border-primary/60 bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary hover:bg-primary/20"
                    >
                      Save endpoint
                    </button>
                  </div>
                </Section>
              </div>
            </div>
          )}
        </div>

        {/* footer: hidden gear (bounces on click) + version */}
        <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
          <button
            key={bounceKey}
            aria-hidden
            tabIndex={-1}
            onClick={onGearClick}
            className="animate-gear-bounce cursor-default select-none bg-transparent px-1 text-[13px] opacity-70 outline-none"
            style={{ background: "transparent" }}
          >
            ⚙️
          </button>
          <div className="font-mono text-[10px] text-muted-foreground">
            PLInt v0.3
          </div>
        </div>
      </div>
    </div>
  );
}

function SecretMenu({ enabled, onBack }: { enabled: string[]; onBack: () => void }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            — Secret Menu
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Enable weird & esoteric interpreters. You've been warned.
          </p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] hover:bg-surface-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Settings
        </button>
      </div>

      <SecretGroup title="Weird languages" langs={WEIRD} enabled={enabled} />
      <SecretGroup title="Esoteric languages" langs={ESOTERIC} enabled={enabled} />
      <SecretGroup title="Assembly" langs={ASSEMBLY} enabled={enabled} />
    </div>
  );
}

function SecretGroup({
  title, langs, enabled,
}: { title: string; langs: LanguageDef[]; enabled: string[] }) {
  return (
    <div className="mb-4">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {langs.map((l) => {
          const on = enabled.includes(l.id);
          return (
            <li key={l.id}>
              <button
                onClick={() => toggleSecretLanguage(l.id)}
                className={
                  "flex w-full items-center justify-between rounded-md border px-3 py-2 font-mono text-[12px] " +
                  (on
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border bg-surface-2/60 text-muted-foreground hover:bg-surface-2")
                }
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{l.name}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground/70">{l.ext}</span>
                </span>
                <span
                  className={
                    "shrink-0 text-[10px] uppercase tracking-wider " +
                    (on ? "text-primary" : "text-muted-foreground/60")
                  }
                >
                  {on ? "enabled" : "off"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        — {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[11px] text-foreground/80">{label}</div>
      {children}
    </div>
  );
}

function Toggle({
  label, checked, onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between font-mono text-[11px]">
      <span className="text-foreground/80">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          "relative h-4 w-8 rounded-full border " +
          (checked ? "border-primary bg-primary/30" : "border-border bg-surface-2")
        }
      >
        <span
          className={
            "absolute top-[1px] h-3 w-3 rounded-full " +
            (checked ? "left-[17px] bg-primary" : "left-[1px] bg-muted-foreground")
          }
          style={{ transition: "left var(--dur-fast) var(--ease), background-color var(--dur-fast) var(--ease)" }}
        />
      </button>
    </label>
  );
}

function Segmented<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="mb-1 font-mono text-[11px] text-foreground/80">{label}</div>
      <div className="inline-flex overflow-hidden rounded-md border border-border">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={
              "px-2.5 py-1 font-mono text-[11px] " +
              (value === o.id
                ? "bg-primary/15 text-primary"
                : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground")
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
