import { useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { LanguageDef } from "@/lib/languages";

interface Props {
  language: LanguageDef;
  value: string;
  onChange: (v: string) => void;
}

export function EditorPane({ language, value, onChange }: Props) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    // Define a PLInt theme once.
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

  // Re-apply theme after language changes (Monaco resets on model swap sometimes).
  useEffect(() => {
    if (ready && monacoRef.current) {
      monacoRef.current.editor.setTheme("plint-dark");
    }
  }, [language.id, ready]);

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-[oklch(0.14_0.015_240)]">
      <Editor
        height="100%"
        language={language.monaco}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={onMount}
        options={{
          fontFamily: "JetBrains Mono, Fira Code, ui-monospace, monospace",
          fontSize: 14,
          fontLigatures: true,
          minimap: { enabled: false },
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: "all",
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
