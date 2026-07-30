import { createContext, useContext } from "react";

export type DialogKind = "alert" | "confirm" | "prompt";

export interface DialogOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface DialogRequest extends DialogOptions {
  kind: DialogKind;
  message: string;
  defaultValue?: string;
  resolve: (value: string | boolean | null) => void;
}

export interface DialogsApi {
  alert: (message: string, opts?: DialogOptions) => Promise<void>;
  confirm: (message: string, opts?: DialogOptions) => Promise<boolean>;
  prompt: (message: string, defaultValue?: string, opts?: DialogOptions) => Promise<string | null>;
}

export const DialogsContext = createContext<DialogsApi | null>(null);

export function useDialogs(): DialogsApi {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error("useDialogs must be used inside <DialogsProvider>");
  return ctx;
}
