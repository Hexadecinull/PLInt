// Editor + app settings, persisted to localStorage.
import { useEffect, useState } from "react";

const KEY = "plint.settings.v3";

export type AccentId = "cyan" | "violet" | "amber" | "rose" | "emerald" | "mono" | "custom";
export type ThemeId = "dark" | "light";

export interface Settings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  ligatures: boolean;
  accent: AccentId;
  deepAccent: boolean;
  theme: ThemeId;
  cursorStyle: "line" | "block" | "underline";
  cursorBlinking: "blink" | "smooth" | "solid";
  showWhitespace: boolean;
  bracketColorization: boolean;
  stickyScroll: boolean;
  indentGuides: boolean;
  density: "compact" | "comfortable";
  reducedMotion: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: false,
  minimap: false,
  lineNumbers: true,
  autoSave: true,
  ligatures: true,
  accent: "cyan",
  deepAccent: false,
  theme: "dark",
  cursorStyle: "line",
  cursorBlinking: "smooth",
  showWhitespace: false,
  bracketColorization: true,
  stickyScroll: false,
  indentGuides: true,
  density: "comfortable",
  reducedMotion: false,
};

function read(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function write(s: Settings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

const listeners = new Set<(s: Settings) => void>();

export function getSettings(): Settings {
  return read();
}

export function setSettings(patch: Partial<Settings>) {
  const next = { ...read(), ...patch };
  write(next);
  listeners.forEach((l) => l(next));
  applyTheme(next.theme);
  applyAccent(next.accent, next.deepAccent, next.theme);
  applyMotion(next.reducedMotion);
  applyDensity(next.density);
}

export function useSettings(): [Settings, (p: Partial<Settings>) => void] {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    setS(read());
    const l = (n: Settings) => setS(n);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return [s, setSettings];
}

// Per-accent hue used for deep-accent (Material You) tinting.
const ACCENT_HUE: Record<AccentId, number> = {
  cyan: 185, violet: 295, amber: 80, rose: 15, emerald: 155, mono: 240,
};

const ACCENT_MAP: Record<AccentId, { primary: string; glow: string; accent: string }> = {
  cyan:    { primary: "oklch(0.82 0.14 185)", glow: "oklch(0.88 0.12 175)", accent: "oklch(0.75 0.10 200)" },
  violet:  { primary: "oklch(0.74 0.15 295)", glow: "oklch(0.82 0.13 280)", accent: "oklch(0.78 0.12 200)" },
  amber:   { primary: "oklch(0.84 0.15 80)",  glow: "oklch(0.90 0.12 85)",  accent: "oklch(0.74 0.13 40)"  },
  rose:    { primary: "oklch(0.74 0.16 15)",  glow: "oklch(0.82 0.14 25)",  accent: "oklch(0.70 0.15 320)" },
  emerald: { primary: "oklch(0.78 0.15 155)", glow: "oklch(0.85 0.12 150)", accent: "oklch(0.74 0.11 200)" },
  mono:    { primary: "oklch(0.92 0.005 240)", glow: "oklch(0.98 0.003 240)", accent: "oklch(0.72 0.02 240)" },
};

// CSS variables that get tinted with the accent hue when Deep accent is on.
// Values are `[L, C]` — chroma varies per surface so lower layers stay subtle.
const DEEP_DARK_SURFACES: [string, number, number][] = [
  ["--background", 0.13, 0.028],
  ["--surface",    0.16, 0.032],
  ["--surface-2",  0.20, 0.038],
  ["--surface-3",  0.25, 0.045],
  ["--card",       0.16, 0.032],
  ["--popover",    0.18, 0.036],
  ["--muted",      0.22, 0.030],
  ["--secondary",  0.24, 0.035],
  ["--input",      0.24, 0.030],
  ["--border",     0.30, 0.055],
  ["--muted-foreground", 0.68, 0.030],
];
const DEEP_LIGHT_SURFACES: [string, number, number][] = [
  ["--background", 0.985, 0.018],
  ["--surface",    0.965, 0.024],
  ["--surface-2",  0.935, 0.032],
  ["--surface-3",  0.900, 0.040],
  ["--card",       0.965, 0.024],
  ["--popover",    0.975, 0.020],
  ["--muted",      0.940, 0.028],
  ["--secondary",  0.925, 0.032],
  ["--input",      0.955, 0.024],
  ["--border",     0.850, 0.060],
  ["--muted-foreground", 0.45, 0.040],
];

const DEEP_CLEAR_KEYS = DEEP_DARK_SURFACES.map(([k]) => k);

export function applyTheme(theme: ThemeId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
}

export function applyAccent(accent: AccentId, deep = false, theme: ThemeId = "dark") {
  if (typeof document === "undefined") return;
  const c = ACCENT_MAP[accent];
  const r = document.documentElement.style;
  r.setProperty("--primary", c.primary);
  r.setProperty("--primary-glow", c.glow);
  r.setProperty("--accent", c.accent);
  r.setProperty("--ring", c.primary);

  // Clear any previously applied deep-accent surface overrides first.
  DEEP_CLEAR_KEYS.forEach((k) => r.removeProperty(k));

  if (!deep || accent === "mono") return;
  const hue = ACCENT_HUE[accent];
  const table = theme === "light" ? DEEP_LIGHT_SURFACES : DEEP_DARK_SURFACES;
  for (const [name, L, C] of table) {
    r.setProperty(name, `oklch(${L} ${C} ${hue})`);
  }
}

export function applyMotion(reduced: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.motion = reduced ? "reduced" : "full";
}

export function applyDensity(density: Settings["density"]) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.density = density;
}
