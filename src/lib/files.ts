// Per-language saved-file system, backed by localStorage.
// A "file" is a named snippet scoped to a language id.

const KEY = "plint.files.v1";

export interface SavedFile {
  id: string;
  languageId: string;
  name: string;
  code: string;
  createdAt: number;
  updatedAt: number;
}

type Store = Record<string, SavedFile>; // keyed by file id

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

export function listFiles(languageId?: string): SavedFile[] {
  const all = Object.values(read());
  const filtered = languageId ? all.filter((f) => f.languageId === languageId) : all;
  return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveFile(input: {
  id?: string;
  languageId: string;
  name: string;
  code: string;
}): SavedFile {
  const store = read();
  const now = Date.now();
  const id = input.id ?? `f_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const existing = store[id];
  const file: SavedFile = {
    id,
    languageId: input.languageId,
    name: input.name.trim() || "untitled",
    code: input.code,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  store[id] = file;
  write(store);
  return file;
}

export function deleteFile(id: string) {
  const store = read();
  delete store[id];
  write(store);
}

export function renameFile(id: string, name: string) {
  const store = read();
  if (!store[id]) return;
  store[id].name = name.trim() || "untitled";
  store[id].updatedAt = Date.now();
  write(store);
}

export function exportAll(): string {
  return JSON.stringify(read(), null, 2);
}

export function importAll(json: string): number {
  const parsed = JSON.parse(json) as Store;
  const store = read();
  let count = 0;
  for (const f of Object.values(parsed)) {
    if (f?.id && f?.languageId && typeof f.code === "string") {
      store[f.id] = f;
      count++;
    }
  }
  write(store);
  return count;
}
