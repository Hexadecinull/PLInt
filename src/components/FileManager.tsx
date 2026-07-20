import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FilePlus2,
  FileUp,
  Files,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { LanguageDef } from "@/lib/languages";
import {
  deleteFile,
  exportAll,
  importAll,
  listFiles,
  renameFile,
  saveFile,
  type SavedFile,
} from "@/lib/files";

interface Props {
  open: boolean;
  onClose: () => void;
  language: LanguageDef;
  code: string;
  currentFileId: string | null;
  onLoad: (file: SavedFile) => void;
  onSaved: (file: SavedFile) => void;
}

export function FileManager({
  open,
  onClose,
  language,
  code,
  currentFileId,
  onLoad,
  onSaved,
}: Props) {
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [name, setName] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (open) setFiles(listFiles(language.id));
  }, [open, language.id, tick]);

  useEffect(() => {
    const current = files.find((f) => f.id === currentFileId);
    setName(current?.name ?? "");
  }, [currentFileId, files]);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  if (!open) return null;

  const handleSave = () => {
    if (!canSave) return;
    const file = saveFile({
      id: currentFileId ?? undefined,
      languageId: language.id,
      name,
      code,
    });
    onSaved(file);
    setTick((t) => t + 1);
  };

  const handleSaveAs = () => {
    if (!canSave) return;
    const file = saveFile({ languageId: language.id, name, code });
    onSaved(file);
    setTick((t) => t + 1);
  };

  const handleExport = () => {
    const blob = new Blob([exportAll()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plint-files-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const n = importAll(text);
        alert(`Imported ${n} files.`);
        setTick((t) => t + 1);
      } catch {
        alert("Invalid file.");
      }
    };
    input.click();
  };

  const handleDownload = (f: SavedFile) => {
    const blob = new Blob([f.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name.endsWith(language.ext) ? f.name : f.name + language.ext;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-popover shadow-[var(--shadow-panel)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Files className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">
              {language.name} files
            </h2>
            <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground">
              {files.length}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="file name (e.g. fizzbuzz)"
            className="rounded-md border border-border bg-input px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-xs transition-colors hover:bg-surface-3 disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" /> {currentFileId ? "Save" : "Create"}
          </button>
          <button
            onClick={handleSaveAs}
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-xs transition-colors hover:bg-surface-3 disabled:opacity-40"
          >
            <FilePlus2 className="h-3.5 w-3.5" /> Save as new
          </button>
        </div>

        <div className="scroll-slim max-h-[50vh] overflow-y-auto border-t border-border">
          {files.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No saved files yet for {language.name}.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {files.map((f) => {
                const isCurrent = f.id === currentFileId;
                return (
                  <li
                    key={f.id}
                    className={
                      "flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-surface-2 " +
                      (isCurrent ? "bg-surface-2" : "")
                    }
                  >
                    <button
                      onClick={() => onLoad(f)}
                      className="flex-1 truncate text-left"
                    >
                      <span className="font-mono text-foreground">{f.name}</span>
                      <span className="ml-2 text-[10px] text-muted-foreground">
                        {new Date(f.updatedAt).toLocaleString()}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        const n = prompt("New name", f.name);
                        if (n) {
                          renameFile(f.id, n);
                          setTick((t) => t + 1);
                        }
                      }}
                      aria-label="Rename"
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownload(f)}
                      aria-label="Download"
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${f.name}"?`)) {
                          deleteFile(f.id);
                          setTick((t) => t + 1);
                        }
                      }}
                      aria-label="Delete"
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <div className="text-[10px] text-muted-foreground">
            Files are stored in your browser (localStorage).
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-[11px] transition-colors hover:bg-surface-3"
            >
              <FileUp className="h-3 w-3" /> Import
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-[11px] transition-colors hover:bg-surface-3"
            >
              <Download className="h-3 w-3" /> Export all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
