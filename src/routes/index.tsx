import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGES, LANG_BY_ID, type LanguageDef } from "@/lib/languages";
import { runCode, type RunResult } from "@/lib/runners";
import { EditorPane } from "@/components/EditorPane";
import { LanguageSidebar } from "@/components/LanguageSidebar";
import { OutputPane } from "@/components/OutputPane";
import { SyntaxGuide } from "@/components/SyntaxGuide";
import { Toolbar } from "@/components/Toolbar";
import { applyAccent, applyDensity, applyMotion, getSettings } from "@/lib/settings";
import type { SavedFile } from "@/lib/files";

const FileManager = lazy(() =>
  import("@/components/FileManager").then((m) => ({ default: m.FileManager }))
);
const SettingsPanel = lazy(() =>
  import("@/components/SettingsPanel").then((m) => ({ default: m.SettingsPanel }))
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PLInt — Online Programming Language Interpreter Hub" },
      {
        name: "description",
        content:
          "Run Python, JavaScript, TypeScript, Java, C#, PHP, SQL, Bash, PowerShell, Batch, Kotlin, Ruby, Go, Dart, C, C++, Rust, Swift, Zig, Haxe, Haskell, OCaml, Lua, Perl and R online — no logins, no installs. Free & open source (GPL-3.0).",
      },
      { property: "og:title", content: "PLInt — Online Interpreter Hub" },
      {
        property: "og:description",
        content:
          "25 languages, one browser tab. Full syntax highlighting, live errors, saved files, instant execution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PLInt,
});

const STORAGE_KEY = "plint.state.v1";

interface PersistedState {
  active: string;
  buffers: Record<string, string>;
  currentFileByLang?: Record<string, string | null>;
}

function loadState(): PersistedState {
  if (typeof window === "undefined") return { active: "python", buffers: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: "python", buffers: {} };
    return JSON.parse(raw);
  } catch {
    return { active: "python", buffers: {} };
  }
}

function PLInt() {
  const [active, setActive] = useState<string>("python");
  const [buffers, setBuffers] = useState<Record<string, string>>({});
  const [currentFileByLang, setCurrentFileByLang] = useState<Record<string, string | null>>({});
  const [fileNameByLang, setFileNameByLang] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filesEverOpened, setFilesEverOpened] = useState(false);
  const [settingsEverOpened, setSettingsEverOpened] = useState(false);
  useEffect(() => { if (filesOpen) setFilesEverOpened(true); }, [filesOpen]);
  useEffect(() => { if (settingsOpen) setSettingsEverOpened(true); }, [settingsOpen]);

  useEffect(() => {
    const s = loadState();
    setActive(s.active in LANG_BY_ID ? s.active : "python");
    setBuffers(s.buffers ?? {});
    setCurrentFileByLang(s.currentFileByLang ?? {});
    setHydrated(true);
    const cfg = getSettings();
    applyAccent(cfg.accent);
    applyMotion(cfg.reducedMotion);
    applyDensity(cfg.density);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const settings = getSettings();
    if (!settings.autoSave) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ active, buffers, currentFileByLang } satisfies PersistedState)
        );
      } catch {
        /* quota */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [active, buffers, currentFileByLang, hydrated]);

  const lang: LanguageDef = LANG_BY_ID[active] ?? LANGUAGES[0];
  const code = useMemo(() => buffers[lang.id] ?? lang.sample, [buffers, lang]);
  const currentFileId = currentFileByLang[lang.id] ?? null;
  const currentFileName = currentFileId ? fileNameByLang[lang.id] ?? null : null;

  const setCode = useCallback(
    (v: string) => setBuffers((b) => ({ ...b, [lang.id]: v })),
    [lang.id]
  );

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    try {
      const r = await runCode(lang, code);
      setResult(r);
    } catch (e) {
      setResult({
        stdout: "",
        stderr: (e as Error).message,
        diagnostics: [],
        durationMs: 0,
        ok: false,
      });
    } finally {
      setRunning(false);
    }
  }, [code, lang, running]);

  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runRef.current();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setFilesOpen(true);
      } else if (e.key === "Escape") {
        setFilesOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const resetSample = () => {
    setBuffers((b) => {
      const next = { ...b };
      delete next[lang.id];
      return next;
    });
    setCurrentFileByLang((m) => ({ ...m, [lang.id]: null }));
  };

  const handleLoad = (file: SavedFile) => {
    setActive(file.languageId);
    setBuffers((b) => ({ ...b, [file.languageId]: file.code }));
    setCurrentFileByLang((m) => ({ ...m, [file.languageId]: file.id }));
    setFileNameByLang((m) => ({ ...m, [file.languageId]: file.name }));
    setFilesOpen(false);
  };

  const handleSaved = (file: SavedFile) => {
    setCurrentFileByLang((m) => ({ ...m, [file.languageId]: file.id }));
    setFileNameByLang((m) => ({ ...m, [file.languageId]: file.name }));
  };

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <Toolbar
        language={lang}
        running={running}
        fileName={currentFileName}
        onRun={run}
        onReset={resetSample}
        onOpenFiles={() => setFilesOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <LanguageSidebar
          active={lang.id}
          onSelect={(l) => {
            setActive(l.id);
            setResult(null);
          }}
        />

        {/* key={lang.id} makes the workspace fade in on language switch. */}
        <main
          key={lang.id}
          className="grid min-h-0 flex-1 animate-fade-in grid-cols-1 gap-2 p-2 sm:gap-3 sm:p-3 lg:grid-cols-[1.6fr_1fr] lg:grid-rows-[1fr_auto]"
        >
          <section className="min-h-[45vh] lg:row-span-2 lg:min-h-0">
            <EditorPane language={lang} value={code} onChange={setCode} />
          </section>
          <section className="min-h-[25vh] lg:min-h-0">
            <OutputPane
              running={running}
              result={result}
              onClear={() => setResult(null)}
            />
          </section>
          <section className="min-h-0 max-h-64">
            <SyntaxGuide lang={lang} />
          </section>
        </main>
      </div>

      <Suspense fallback={null}>
        {filesEverOpened && (
          <FileManager
            open={filesOpen}
            onClose={() => setFilesOpen(false)}
            language={lang}
            code={code}
            currentFileId={currentFileId}
            onLoad={handleLoad}
            onSaved={handleSaved}
          />
        )}
        {settingsEverOpened && (
          <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        )}
      </Suspense>
    </div>
  );
}
