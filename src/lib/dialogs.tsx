import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useAnimatedOpen } from "@/hooks/use-animated-open";

type DialogKind = "alert" | "confirm" | "prompt";

interface DialogOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface DialogRequest extends DialogOptions {
  kind: DialogKind;
  message: string;
  defaultValue?: string;
  resolve: (value: string | boolean | null) => void;
}

interface DialogsApi {
  alert: (message: string, opts?: DialogOptions) => Promise<void>;
  confirm: (message: string, opts?: DialogOptions) => Promise<boolean>;
  prompt: (message: string, defaultValue?: string, opts?: DialogOptions) => Promise<string | null>;
}

const DialogsContext = createContext<DialogsApi | null>(null);

export function useDialogs(): DialogsApi {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error("useDialogs must be used inside <DialogsProvider>");
  return ctx;
}

export function DialogsProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const [inputValue, setInputValue] = useState("");
  const { mounted, state } = useAnimatedOpen(request !== null);

  const api = useRef<DialogsApi>({
    alert: (message, opts) =>
      new Promise<void>((resolve) => {
        setRequest({ kind: "alert", message, ...opts, resolve: () => resolve() });
      }),
    confirm: (message, opts) =>
      new Promise<boolean>((resolve) => {
        setRequest({
          kind: "confirm",
          message,
          ...opts,
          resolve: (v) => resolve(v === true),
        });
      }),
    prompt: (message, defaultValue, opts) =>
      new Promise<string | null>((resolve) => {
        setInputValue(defaultValue ?? "");
        setRequest({
          kind: "prompt",
          message,
          defaultValue,
          ...opts,
          resolve: (v) => resolve(typeof v === "string" ? v : null),
        });
      }),
  }).current;

  const close = useCallback(
    (value: string | boolean | null) => {
      setRequest((r) => {
        r?.resolve(value);
        return null;
      });
    },
    []
  );

  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(request.kind === "prompt" ? null : false);
      } else if (e.key === "Enter" && request.kind !== "prompt") {
        close(request.kind === "confirm" ? true : null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [request, close]);

  return (
    <DialogsContext.Provider value={api}>
      {children}
      {mounted &&
        request &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            data-state={state}
            data-anim="overlay"
            style={{ background: "oklch(0 0 0 / 0.65)" }}
            onClick={() => close(request.kind === "prompt" ? null : false)}
          >
            <div
              className="w-full max-w-sm overflow-hidden rounded-md border border-border bg-popover shadow-[var(--shadow-panel)]"
              onClick={(e) => e.stopPropagation()}
              data-state={state}
              data-anim="panel"
              role="alertdialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span className="text-primary">~$</span>
                  <span>
                    {request.title ??
                      (request.kind === "confirm"
                        ? "confirm"
                        : request.kind === "prompt"
                        ? "input required"
                        : "notice")}
                  </span>
                </div>
                <button
                  onClick={() => close(request.kind === "prompt" ? null : false)}
                  aria-label="Close"
                  className="rounded p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                <p className="whitespace-pre-wrap font-mono text-[13px] text-foreground">
                  {request.message}
                </p>
                {request.kind === "prompt" && (
                  <input
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") close(inputValue);
                    }}
                    className="mt-3 w-full rounded-md border border-border bg-input px-3 py-1.5 font-mono text-[12px] outline-none focus:border-primary"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-border px-4 py-2.5">
                {request.kind !== "alert" && (
                  <button
                    onClick={() => close(request.kind === "prompt" ? null : false)}
                    className="rounded-md border border-border bg-surface-2 px-3 py-1.5 font-mono text-[11px] hover:bg-surface-3"
                  >
                    {request.cancelLabel ?? "cancel"}
                  </button>
                )}
                <button
                  autoFocus={request.kind !== "prompt"}
                  onClick={() => close(request.kind === "prompt" ? inputValue : true)}
                  className={
                    "rounded-md px-3 py-1.5 font-mono text-[11px] font-medium " +
                    (request.danger
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90")
                  }
                >
                  {request.confirmLabel ??
                    (request.kind === "alert" ? "ok" : request.kind === "prompt" ? "submit" : "confirm")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </DialogsContext.Provider>
  );
}
