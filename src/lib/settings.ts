// Editor + app settings, persisted to localStorage.
import { useEffect, useState } from "react";

const KEY = "plint.settings.v2";

export interface Settings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  ligatures: boolean;
  accent: "cyan" | "violet" | "amber" | "rose" | "emerald" | "mono";
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
  applyAccent(next.accent);
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

const ACCENT_MAP: Record<Settings["accent"], { primary: string; glow: string; accent: string }> = {
  cyan:    { primary: "oklch(0.82 0.14 185)", glow: "oklch(0.88 0.12 175)", accent: "oklch(0.75 0.10 200)" },
  violet:  { primary: "oklch(0.74 0.15 295)", glow: "oklch(0.82 0.13 280)", accent: "oklch(0.78 0.12 200)" },
  amber:   { primary: "oklch(0.84 0.15 80)",  glow: "oklch(0.90 0.12 85)",  accent: "oklch(0.74 0.13 40)"  },
  rose:    { primary: "oklch(0.74 0.16 15)",  glow: "oklch(0.82 0.14 25)",  accent: "oklch(0.70 0.15 320)" },
  emerald: { primary: "oklch(0.78 0.15 155)", glow: "oklch(0.85 0.12 150)", accent: "oklch(0.74 0.11 200)" },
  mono:    { primary: "oklch(0.92 0.005 240)", glow: "oklch(0.98 0.003 240)", accent: "oklch(0.72 0.02 240)" },
};

export function applyAccent(accent: Settings["accent"]) {
  if (typeof document === "undefined") return;
  const c = ACCENT_MAP[accent];
  const r = document.documentElement.style;
  r.setProperty("--primary", c.primary);
  r.setProperty("--primary-glow", c.glow);
  r.setProperty("--accent", c.accent);
  r.setProperty("--ring", c.primary);
}

export function applyMotion(reduced: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.motion = reduced ? "reduced" : "full";
}

export function applyDensity(density: Settings["density"]) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.density = density;
}
