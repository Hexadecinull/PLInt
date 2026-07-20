// Editor + app settings, persisted to localStorage.
import { useEffect, useState } from "react";

const KEY = "plint.settings.v1";

export interface Settings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  ligatures: boolean;
  accent: "cyan" | "violet" | "amber" | "rose" | "emerald";
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
  cyan:    { primary: "oklch(0.78 0.16 190)", glow: "oklch(0.85 0.14 175)", accent: "oklch(0.72 0.14 285)" },
  violet:  { primary: "oklch(0.72 0.18 295)", glow: "oklch(0.80 0.16 280)", accent: "oklch(0.75 0.15 200)" },
  amber:   { primary: "oklch(0.82 0.17 75)",  glow: "oklch(0.88 0.14 85)",  accent: "oklch(0.72 0.16 35)"  },
  rose:    { primary: "oklch(0.72 0.19 15)",  glow: "oklch(0.80 0.16 25)",  accent: "oklch(0.68 0.18 320)" },
  emerald: { primary: "oklch(0.76 0.17 160)", glow: "oklch(0.83 0.14 150)", accent: "oklch(0.72 0.14 200)" },
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
