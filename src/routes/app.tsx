import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { LANG_BY_ID, type LanguageDef } from "@/lib/languages";
import { runCode, type RunResult } from "@/lib/runners";
import { EditorPane } from "@/components/EditorPane";
import { LanguageSidebar } from "@/components/LanguageSidebar";
import { OutputPane } from "@/components/OutputPane";
import { SyntaxGuide } from "@/components/SyntaxGuide";
import { Toolbar } from "@/components/Toolbar";
import { applyAccent, applyDensity, applyMotion, getSettings } from "@/lib/settings";
import type { SavedFile } from "@/lib/files";
import { useSecretState, enabledLanguages } from "@/lib/secret";

const FileManager = lazy(() =>
  import("@/components/FileManager").then((m) => ({ default: m.FileManager }))
);
const SettingsPanel = lazy(() =>
  import("@/components/SettingsPanel").then((m) => ({ default: m.SettingsPanel }))
);

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "PLInt — Workspace" },
      {
        name: "description",
        content:
          "The PLInt workspace: run and edit code in 30+ programming languages, with saved files, live errors and full syntax highlighting.",
      },
      { property: "og:title", content: "PLInt — Workspace" },
      {
        property: "og:description",
        content: "Run 30+ programming languages online — instantly, in one tab.",
      },
    ],
  }),
  component: PLInt,
});

const STORAGE_KEY = "plint.state.v1";
const LAYOUT_KEY = "plint.layout.v1";

interface PersistedState {
  active: string;
  buffers: Record<string, string>;
  currentFileByLang?: Record<string, string | null>;
  sidebarCollapsed?: boolean;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [secret] = useSecretState();

  useEffect(() => { if (filesOpen) setFilesEverOpened(true); }, [filesOpen]);
  useEffect(() => { if (settingsOpen) setSettingsEverOpened(true); }, [settingsOpen]);

  useEffect(() => {
    const s = loadState();
    setActive(s.active in LANG_BY_ID ? s.active : "python");
    setBuffers(s.buffers ?? {});
    setCurrentFileByLang(s.currentFileByLang ?? {});
    setSidebarCollapsed(Boolean(s.sidebarCollapsed));
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
          JSON.stringify({
            active, buffers, currentFileByLang, sidebarCollapsed,
          } satisfies PersistedState)
        );
      } catch { /* quota */ }
    }, 400);
    return () => clearTimeout(t);
  }, [active, buffers, currentFileByLang, sidebarCollapsed, hydrated]);

  const langs = useMemo(() => enabledLanguages(secret), [secret]);
  const lang: LanguageDef = LANG_BY_ID[active] ?? langs[0];
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
        stdout: "", stderr: (e as Error).message, diagnostics: [],
        durationMs: 0, ok: false,
      });
    } finally {
      setRunning(false);
    }
  }, [code, lang, running]);

  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        runRef.current();
      } else if (e.ctrlKey && e.key.toLowerCase() === "s") {
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
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        onRun={run}
        onReset={resetSample}
        onOpenFiles={() => setFilesOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        {/* Desktop: resizable layout with collapsible sidebar. */}
        <div className="hidden min-h-0 flex-1 md:flex">
          <PanelGroup
            direction="horizontal"
            autoSaveId={`${LAYOUT_KEY}.h`}
            className="min-h-0 flex-1"
          >
            {!sidebarCollapsed && (
              <>
                <Panel defaultSize={16} minSize={10} maxSize={30} className="min-h-0">
                  <LanguageSidebar
                    languages={langs}
                    active={lang.id}
                    onSelect={(l) => { setActive(l.id); setResult(null); }}
                  />
                </Panel>
                <PanelResizeHandle className="w-1 bg-border/60 transition-colors hover:bg-primary/60" />
              </>
            )}
            <Panel minSize={30} className="min-h-0">
              <PanelGroup direction="vertical" autoSaveId={`${LAYOUT_KEY}.v`}>
                <Panel defaultSize={70} minSize={20} className="min-h-0">
                  <PanelGroup direction="horizontal" autoSaveId={`${LAYOUT_KEY}.eo`} className="p-2">
                    <Panel defaultSize={60} minSize={20} className="min-h-0">
                      <EditorPane language={lang} value={code} onChange={setCode} />
                    </Panel>
                    <PanelResizeHandle className="mx-1 w-1 bg-border/60 transition-colors hover:bg-primary/60" />
                    <Panel defaultSize={40} minSize={20} className="min-h-0">
                      <OutputPane running={running} result={result} onClear={() => setResult(null)} />
                    </Panel>
                  </PanelGroup>
                </Panel>
                <PanelResizeHandle className="h-1 bg-border/60 transition-colors hover:bg-primary/60" />
                <Panel defaultSize={30} minSize={10} className="min-h-0 p-2 pt-0">
                  <SyntaxGuide lang={lang} />
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </div>

        {/* Mobile: stacked layout with drawer sidebar. */}
        <div className="flex min-h-0 flex-1 md:hidden">
          <LanguageSidebar
            languages={langs}
            active={lang.id}
            onSelect={(l) => { setActive(l.id); setResult(null); }}
          />
          <main
            key={lang.id}
            className="flex min-h-0 flex-1 animate-fade-in flex-col gap-2 p-2"
          >
            <section className="min-h-[45vh] flex-1">
              <EditorPane language={lang} value={code} onChange={setCode} />
            </section>
            <section className="min-h-[25vh]">
              <OutputPane running={running} result={result} onClear={() => setResult(null)} />
            </section>
            <section className="max-h-64 min-h-0">
              <SyntaxGuide lang={lang} />
            </section>
          </main>
        </div>
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
