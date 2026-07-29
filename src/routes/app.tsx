import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import { LANG_BY_ID, type LanguageDef } from "@/lib/languages";
import { runCode, type RunResult } from "@/lib/runners";
import { EditorPane } from "@/components/EditorPane";
import { LanguageSidebar } from "@/components/LanguageSidebar";
import { OutputPane } from "@/components/OutputPane";
import { SyntaxGuide } from "@/components/SyntaxGuide";
import { Toolbar } from "@/components/Toolbar";
import { applyAccent, applyDensity, applyMotion, applyTheme, getSettings, useSettings } from "@/lib/settings";
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
      { title: "PLInt - Workspace" },
      {
        name: "description",
        content:
          "The PLInt workspace: run and edit code in 125+ programming languages, with saved files, live errors and full syntax highlighting.",
      },
      { property: "og:title", content: "PLInt - Workspace" },
      {
        property: "og:description",
        content: "Run 125+ programming languages online - instantly, in one tab.",
      },
    ],
  }),
  component: PLInt,
});

const STORAGE_KEY = "plint.state.v1";

interface PersistedState {
  active: string;
  buffers: Record<string, string>;
  currentFileByLang?: Record<string, string | null>;
  sidebarCollapsed?: boolean;
}

function loadState(): PersistedState {
  const fallback = typeof window === "undefined" ? "python" : getSettings().defaultLanguage;
  if (typeof window === "undefined") return { active: fallback, buffers: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: fallback, buffers: {} };
    return JSON.parse(raw);
  } catch {
    return { active: fallback, buffers: {} };
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
  const [settings] = useSettings();
  const sidebarPanelRef = usePanelRef();

  useEffect(() => { if (filesOpen) setFilesEverOpened(true); }, [filesOpen]);
  useEffect(() => { if (settingsOpen) setSettingsEverOpened(true); }, [settingsOpen]);

  useEffect(() => {
    const s = loadState();
    setActive(s.active in LANG_BY_ID ? s.active : getSettings().defaultLanguage);
    setBuffers(s.buffers ?? {});
    setCurrentFileByLang(s.currentFileByLang ?? {});
    setSidebarCollapsed(Boolean(s.sidebarCollapsed));
    setHydrated(true);
    const cfg = getSettings();
    applyTheme(cfg.theme);
    applyAccent(cfg.accent, cfg.deepAccent, cfg.theme, cfg.customAccentHex);
    applyMotion(cfg.reducedMotion);
    applyDensity(cfg.density);
  }, []);

  // react-resizable-panels applies className/style to a nested wrapper,
  // not the flex-sized root, so the collapse transition has to be
  // toggled on elementRef directly, only briefly so drag stays instant.
  const sidebarElRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const p = sidebarPanelRef.current;
    const el = sidebarElRef.current;
    if (!p) return;
    el?.classList.add("sidebar-anim");
    if (sidebarCollapsed) p.collapse();
    else p.expand();
    const t = setTimeout(() => el?.classList.remove("sidebar-anim"), 280);
    return () => clearTimeout(t);
  }, [sidebarCollapsed, hydrated, sidebarPanelRef]);


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

  // Debounced auto-run: only active when the user opts in via workspace
  // settings, so it doesn't surprise anyone or burn server CPU by default.
  useEffect(() => {
    if (!hydrated || !settings.autoRunOnChange) return;
    const t = setTimeout(() => runRef.current(), 800);
    return () => clearTimeout(t);
  }, [code, settings.autoRunOnChange, hydrated]);

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
    <div className="relative flex h-screen w-screen animate-page-in flex-col overflow-hidden bg-background text-foreground">
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
          <Group orientation="horizontal" className="flex min-h-0 flex-1">
            <Panel
              panelRef={sidebarPanelRef}
              elementRef={sidebarElRef}
              id="sidebar"
              defaultSize="18%"
              minSize="200px"
              maxSize="34%"
              collapsible
              collapsedSize={0}
              className="min-h-0 overflow-hidden"
            >

              <div
                data-sidebar-inner
                data-collapsed={sidebarCollapsed || undefined}
                className="flex h-full min-w-[200px]"
              >
                <LanguageSidebar
                  languages={langs}
                  active={lang.id}
                  onSelect={(l) => { setActive(l.id); setResult(null); }}
                />
              </div>
            </Panel>
            {!sidebarCollapsed && (
              <Separator className="w-1 bg-border/60 transition-colors hover:bg-primary/60" />
            )}
            <Panel minSize="30%" className="min-h-0">
              <Group orientation="vertical" className="flex min-h-0 flex-1 flex-col">
                <Panel defaultSize="70%" minSize="20%" className="min-h-0">
                  <Group orientation="horizontal" className="flex min-h-0 flex-1 p-2">
                    <Panel defaultSize="60%" minSize="20%" className="min-h-0">
                      <EditorPane language={lang} value={code} onChange={setCode} />
                    </Panel>
                    <Separator className="mx-1 w-1 bg-border/60 transition-colors hover:bg-primary/60" />
                    <Panel defaultSize="40%" minSize="20%" className="min-h-0">
                      <OutputPane running={running} result={result} onClear={() => setResult(null)} />
                    </Panel>
                  </Group>
                </Panel>
                <Separator className="h-1 bg-border/60 transition-colors hover:bg-primary/60" />
                <Panel defaultSize="30%" minSize="10%" className="min-h-0 p-2 pt-0">
                  <SyntaxGuide lang={lang} />
                </Panel>
              </Group>
            </Panel>
          </Group>
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
