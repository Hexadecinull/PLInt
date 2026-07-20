import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGES, LANG_BY_ID, type LanguageDef } from "@/lib/languages";
import { runCode, type RunResult } from "@/lib/runners";
import { EditorPane } from "@/components/EditorPane";
import { LanguageSidebar } from "@/components/LanguageSidebar";
import { OutputPane } from "@/components/OutputPane";
import { SyntaxGuide } from "@/components/SyntaxGuide";
import { Toolbar } from "@/components/Toolbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PLInt — Online Programming Language Interpreter Hub" },
      {
        name: "description",
        content:
          "Run Python, JavaScript, TypeScript, Java, C#, PHP, SQL, Bash, PowerShell, Batch, Kotlin, Ruby, Go, Dart, C, C++ and Lua online — no logins, no installs. Free & open source (GPL-3.0).",
      },
      { property: "og:title", content: "PLInt — Online Interpreter Hub" },
      {
        property: "og:description",
        content:
          "17 languages, one browser tab. Full syntax highlighting, live errors, instant execution.",
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
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = loadState();
    setActive(s.active in LANG_BY_ID ? s.active : "python");
    setBuffers(s.buffers ?? {});
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ active, buffers } satisfies PersistedState)
      );
    } catch {
      /* ignore quota errors */
    }
  }, [active, buffers, hydrated]);

  const lang: LanguageDef = LANG_BY_ID[active] ?? LANGUAGES[0];
  const code = useMemo(() => buffers[lang.id] ?? lang.sample, [buffers, lang]);

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
  };

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <Toolbar language={lang} running={running} onRun={run} onReset={resetSample} />

      <div className="flex min-h-0 flex-1">
        <LanguageSidebar
          active={lang.id}
          onSelect={(l) => {
            setActive(l.id);
            setResult(null);
          }}
        />

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[1.6fr_1fr] lg:grid-rows-[1fr_auto]">
          <section className="min-h-0 lg:row-span-2">
            <EditorPane language={lang} value={code} onChange={setCode} />
          </section>
          <section className="min-h-0">
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
    </div>
  );
}
