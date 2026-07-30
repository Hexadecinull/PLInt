import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FilePlus2,
  FileUp,
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
import { useAnimatedOpen } from "@/hooks/use-animated-open";
import { useDialogs } from "@/lib/dialogs-context";
import { useSettings } from "@/lib/settings";

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
  const { mounted, state } = useAnimatedOpen(open);
  const dialogs = useDialogs();
  const [settings] = useSettings();

  useEffect(() => {
    if (open) setFiles(listFiles(language.id));
  }, [open, language.id, tick]);

  useEffect(() => {
    const current = files.find((f) => f.id === currentFileId);
    setName(current?.name ?? "");
  }, [currentFileId, files]);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  if (!mounted) return null;

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
        await dialogs.alert(`Imported ${n} files.`, { title: "import" });
        setTick((t) => t + 1);
      } catch {
        await dialogs.alert("Invalid file.", { title: "import" });
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-state={state}
      data-anim="overlay"
      style={{ background: "oklch(0 0 0 / 0.65)" }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-md border border-border bg-popover shadow-[var(--shadow-panel)]"
        onClick={(e) => e.stopPropagation()}
        data-state={state}
        data-anim="panel"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="text-primary">~/</span>
            <span>{language.name.toLowerCase()}/files · {files.length}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-2 p-4 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="file name (e.g. fizzbuzz)"
            className="rounded-md border border-border bg-input px-3 py-1.5 font-mono text-[12px] outline-none focus:border-primary"
          />
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 py-1.5 font-mono text-[11px] hover:bg-surface-3 disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" /> {currentFileId ? "save" : "create"}
          </button>
          <button
            onClick={handleSaveAs}
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 py-1.5 font-mono text-[11px] hover:bg-surface-3 disabled:opacity-40"
          >
            <FilePlus2 className="h-3.5 w-3.5" /> save as
          </button>
        </div>

        <div className="scroll-slim max-h-[50vh] overflow-y-auto border-t border-border">
          {files.length === 0 ? (
            <div className="p-8 text-center font-mono text-[11px] text-muted-foreground">
              no saved files yet for {language.name.toLowerCase()}.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {files.map((f) => {
                const isCurrent = f.id === currentFileId;
                return (
                  <li
                    key={f.id}
                    className={
                      "flex items-center gap-2 px-4 py-1.5 font-mono text-[12px] hover:bg-surface-2 " +
                      (isCurrent ? "bg-surface-2" : "")
                    }
                  >
                    <span className="text-muted-foreground/50">{isCurrent ? "›" : " "}</span>
                    <button onClick={() => onLoad(f)} className="flex-1 truncate text-left">
                      <span className="text-foreground">{f.name}</span>
                      <span className="ml-2 text-[10px] text-muted-foreground">
                        {new Date(f.updatedAt).toLocaleString()}
                      </span>
                    </button>
                    <IconMini onClick={async () => {
                      const n = await dialogs.prompt("New name for this file:", f.name, { title: "rename file" });
                      if (n) { renameFile(f.id, n); setTick((t) => t + 1); }
                    }} label="Rename"><Pencil className="h-3.5 w-3.5" /></IconMini>
                    <IconMini onClick={() => handleDownload(f)} label="Download"><Download className="h-3.5 w-3.5" /></IconMini>
                    <IconMini
                      onClick={async () => {
                        const ok = settings.confirmBeforeDelete
                          ? await dialogs.confirm(`Delete "${f.name}"? This can't be undone.`, {
                              title: "delete file",
                              confirmLabel: "delete",
                              danger: true,
                            })
                          : true;
                        if (ok) {
                          deleteFile(f.id);
                          setTick((t) => t + 1);
                        }
                      }}
                      label="Delete"
                      danger
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconMini>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <div className="font-mono text-[10px] text-muted-foreground">
            stored locally · localStorage
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[10px] hover:bg-surface-3"
            >
              <FileUp className="h-3 w-3" /> import
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[10px] hover:bg-surface-3"
            >
              <Download className="h-3 w-3" /> export all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconMini({
  onClick, label, danger, children,
}: {
  onClick: () => void;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={
        "rounded p-1 text-muted-foreground " +
        (danger ? "hover:bg-destructive/20 hover:text-destructive" : "hover:bg-surface-3 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
