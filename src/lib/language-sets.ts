// Small helper module to avoid circular imports.
import { LANGUAGES } from "./languages";

export const CORE_SET = new Set(LANGUAGES.map((l) => l.id));
