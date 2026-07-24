import { useEffect, useRef, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { getServerEndpoint, setServerEndpoint } from "@/lib/runners";
import { useSettings, type Settings } from "@/lib/settings";
import { useAnimatedOpen } from "@/hooks/use-animated-open";
import { ALL_LANGUAGES, WEIRD, ESOTERIC, ASSEMBLY, type LanguageDef } from "@/lib/languages";
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
  const [showAbout, setShowAbout] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const [bounceKey, setBounceKey] = useState(0);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) setEndpoint(getServerEndpoint());
  }, [open]);

  useEffect(() => {
    if (!open) {
      setShowSecret(false);
      setShowAbout(false);
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
          {showAbout ? (
            <AboutView onBack={() => setShowAbout(false)} />
          ) : showSecret ? (
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
                    <div className="flex flex-wrap items-center gap-2">
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
                      <button
                        onClick={() => setShowCustomPicker((v) => !v)}
                        className={
                          "flex h-6 items-center gap-1 rounded-md border px-2 font-mono text-[10px] uppercase " +
                          (settings.accent === "custom"
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground hover:text-foreground")
                        }
                      >
                        {showCustomPicker ? "▾" : "▸"} Custom
                      </button>
                    </div>
                    {showCustomPicker && (
                      <CustomColorPicker
                        hex={settings.customAccentHex ?? "#4dd0e1"}
                        onChange={(hex) => update({ accent: "custom", customAccentHex: hex })}
                      />
                    )}
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
            <button
              onClick={() => setShowAbout(true)}
              className="text-primary hover:underline"
            >
              About
            </button>
            {" \u00A0•\u00A0 PLInt v0.3"}
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

function AboutView({ onBack }: { onBack: () => void }) {
  const total = ALL_LANGUAGES.length;

  return (
    <div className="animate-fade-in font-mono text-[12px] leading-relaxed">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-primary">— About PLInt</div>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-[11px] hover:bg-surface-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-md border border-primary/50 bg-primary/10 text-primary text-lg">
          {"{;}"}
        </div>
        <div>
          <div className="text-[15px] font-semibold text-foreground">PLInt</div>
          <div className="text-[11px] text-muted-foreground">
            Programming Language Interpreter Hub — v0.3
          </div>
        </div>
      </div>

      <AboutSection title="Authors">
        Built with the PLInt team on Lovable.
      </AboutSection>

      <AboutSection title="Coded in">
        TypeScript · React 19 · TanStack Start · Vite · Tailwind CSS v4 ·
        Monaco Editor · react-resizable-panels
      </AboutSection>

      <AboutSection title={`Languages supported (${total})`}>
        <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground sm:grid-cols-3">
          {ALL_LANGUAGES.map((l) => (
            <li key={l.id} className="truncate">
              <span className="text-foreground/80">{l.name}</span>
              <span className="ml-1 text-muted-foreground/60">{l.ext}</span>
            </li>
          ))}
        </ul>
      </AboutSection>

      <AboutSection title="Open-source runtimes used">
        Pyodide (Python) · wasmoon (Lua) · sql.js (SQL) · ruby.wasm · php-wasm ·
        Monaco Editor (MIT) · react-resizable-panels (MIT) · Tailwind CSS (MIT) ·
        Radix UI (MIT) · lucide-react (ISC)
      </AboutSection>

      <AboutSection title="PLInt License">
        <a
          href="https://www.gnu.org/licenses/gpl-3.0.html"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          GNU General Public License v3.0
        </a>
      </AboutSection>
    </div>
  );
}

function AboutSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}

function CustomColorPicker({
  hex, onChange,
}: { hex: string; onChange: (hex: string) => void }) {
  const parsed = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  const [text, setText] = useState(parsed ? "#" + parsed[1].toLowerCase() : "#4dd0e1");

  // Simple hue slider + hex input. Circle is positioned via a linear
  // horizontal hue bar (0–360°); intuitive without needing a full square.
  const hue = (() => {
    const m = /^#?([0-9a-fA-F]{6})$/.exec(text);
    if (!m) return 190;
    const n = parseInt(m[1], 16);
    const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max === min) return 0;
    const d = max - min;
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return h * 60;
  })();

  const hueToHex = (h: number) => {
    const s = 0.7, l = 0.55;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${to(r)}${to(g)}${to(b)}`;
  };

  const commit = (v: string) => {
    setText(v);
    if (/^#?([0-9a-fA-F]{6})$/.test(v)) onChange(v.startsWith("#") ? v : "#" + v);
  };

  return (
    <div className="mt-2 rounded-md border border-border bg-surface-2/60 p-3">
      <div
        className="relative mb-2 h-3 w-full rounded-full"
        style={{
          background:
            "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
        }}
      >
        <input
          type="range" min={0} max={360} step={1} value={Math.round(hue)}
          onChange={(e) => commit(hueToHex(Number(e.target.value)))}
          className="absolute inset-0 h-3 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow"
          aria-label="Hue"
        />
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-6 w-6 shrink-0 rounded-md border border-border"
          style={{ background: /^#?([0-9a-fA-F]{6})$/.test(text) ? (text.startsWith("#") ? text : "#" + text) : "#000" }}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => commit(e.target.value)}
          placeholder="#4dd0e1"
          className="w-full rounded-md border border-border bg-input px-2 py-1 font-mono text-[11px] outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}
