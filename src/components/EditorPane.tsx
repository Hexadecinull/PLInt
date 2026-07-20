import { useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { LanguageDef } from "@/lib/languages";
import { useSettings } from "@/lib/settings";

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

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.defineTheme("plint-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b8299", fontStyle: "italic" },
        { token: "keyword", foreground: "7ee6d1" },
        { token: "string", foreground: "e6c98a" },
        { token: "number", foreground: "b892ff" },
        { token: "type", foreground: "7ec9ff" },
      ],
      colors: {
        "editor.background": "#131b23",
        "editor.foreground": "#e3ecf1",
        "editorLineNumber.foreground": "#3d5468",
        "editorLineNumber.activeForeground": "#7ee6d1",
        "editor.selectionBackground": "#1f3a45",
        "editor.lineHighlightBackground": "#17222b",
        "editorCursor.foreground": "#7ee6d1",
        "editorIndentGuide.background1": "#1e2a34",
        "editorIndentGuide.activeBackground1": "#2c3e4c",
      },
    });
    monaco.editor.setTheme("plint-dark");
    setReady(true);
  };

  useEffect(() => {
    if (ready && monacoRef.current) {
      monacoRef.current.editor.setTheme("plint-dark");
    }
  }, [language.id, ready]);

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-[oklch(0.14_0.015_240)] animate-fade-in">
      <Editor
        height="100%"
        language={language.monaco}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={onMount}
        loading={
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
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
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: "all",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
