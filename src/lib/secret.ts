// Manages which "secret" (weird / esoteric) language interpreters are enabled.
import { useEffect, useState } from "react";
import { CORE_SET } from "./language-sets";
import { ALL_LANGUAGES, type LanguageDef } from "./languages";

const KEY = "plint.secret.v1";

export interface SecretState {
  unlocked: boolean;
  enabled: string[]; // language ids
}

const DEFAULT: SecretState = { unlocked: false, enabled: [] };

// Cached in memory to avoid a localStorage round-trip and JSON.parse
// on every read, which happens on every secret-menu toggle.
let cache: SecretState | null = null;

function read(): SecretState {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT;
  let result: SecretState = DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) result = { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    result = DEFAULT;
  }
  cache = result;
  return result;
}

function write(s: SecretState) {
  cache = s;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

const listeners = new Set<(s: SecretState) => void>();

export function getSecretState(): SecretState {
  return read();
}
export function setSecretState(patch: Partial<SecretState>) {
  const next = { ...read(), ...patch };
  write(next);
  listeners.forEach((l) => l(next));
}
export function toggleSecretLanguage(id: string) {
  const s = read();
  const has = s.enabled.includes(id);
  const enabled = has ? s.enabled.filter((x) => x !== id) : [...s.enabled, id];
  setSecretState({ enabled });
}

export function useSecretState(): [SecretState, (p: Partial<SecretState>) => void] {
  const [s, setS] = useState<SecretState>(DEFAULT);
  useEffect(() => {
    setS(read());
    const l = (n: SecretState) => setS(n);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return [s, setSecretState];
}

export function enabledLanguages(state: SecretState): LanguageDef[] {
  return ALL_LANGUAGES.filter(
    (l) => CORE_SET.has(l.id) || state.enabled.includes(l.id)
  );
}
