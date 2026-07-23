import { useEffect, useRef, useState } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import type { LanguageDef } from "@/lib/languages";
import { useSettings } from "@/lib/settings";
import { registerCustomLanguages } from "@/lib/monaco-languages";

interface Props {
  language: LanguageDef;
  value: string;
  onChange: (v: string) => void;
}

export function EditorPane({ language, value, onChange }: Props) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [settings] = useSettings();

  const beforeMount: BeforeMount = (monaco) => {
    registerCustomLanguages(monaco);
    monaco.editor.defineTheme("plint-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "5a6472", fontStyle: "italic" },
        { token: "keyword", foreground: "b8ecdc" },
        { token: "string", foreground: "e6c98a" },
        { token: "number", foreground: "b892ff" },
        { token: "type", foreground: "7ec9ff" },
        { token: "variable", foreground: "e3ecf1" },
      ],
      colors: {
        "editor.background": "#0f1418",
        "editor.foreground": "#e3ecf1",
        "editorLineNumber.foreground": "#3a4550",
        "editorLineNumber.activeForeground": "#b8ecdc",
        "editor.selectionBackground": "#1e2f38",
        "editor.lineHighlightBackground": "#141a20",
        "editorCursor.foreground": "#b8ecdc",
        "editorIndentGuide.background1": "#1a2028",
        "editorIndentGuide.activeBackground1": "#2a3540",
        "editorWhitespace.foreground": "#2a3540",
      },
    });
    monaco.editor.defineTheme("plint-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "7a8391", fontStyle: "italic" },
        { token: "keyword", foreground: "0a7a6a" },
        { token: "string", foreground: "8a5a10" },
        { token: "number", foreground: "5a3fbf" },
        { token: "type", foreground: "1c5fa8" },
      ],
      colors: {
        "editor.background": "#fafbfc",
        "editor.foreground": "#1a2028",
      },
    });
  };

  const themeName = settings.theme === "light" ? "plint-light" : "plint-dark";

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.setTheme(themeName);
    setReady(true);
  };

  useEffect(() => {
    if (ready && monacoRef.current) {
      monacoRef.current.editor.setTheme(themeName);
    }
  }, [language.id, ready, themeName]);

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border bg-[oklch(0.10_0.005_240)]">
      <Editor
        height="100%"
        language={language.monaco}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        beforeMount={beforeMount}
        onMount={onMount}
        loading={
          <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-primary" />
            <span className="ml-2">loading editor…</span>
          </div>
        }
        options={{
          fontFamily: "JetBrains Mono, Fira Code, ui-monospace, monospace",
          fontSize: settings.fontSize,
          fontLigatures: settings.ligatures,
          minimap: { enabled: settings.minimap },
          wordWrap: settings.wordWrap ? "on" : "off",
          lineNumbers: settings.lineNumbers ? "on" : "off",
          tabSize: settings.tabSize,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          cursorStyle: settings.cursorStyle,
          cursorBlinking: settings.cursorBlinking,
          renderWhitespace: settings.showWhitespace ? "all" : "none",
          bracketPairColorization: { enabled: settings.bracketColorization },
          stickyScroll: { enabled: settings.stickyScroll },
          guides: { indentation: settings.indentGuides, bracketPairs: settings.bracketColorization },
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "line",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
