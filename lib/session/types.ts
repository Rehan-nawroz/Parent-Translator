import type { LanguageCode } from "@/lib/config/languages";
import type { AnalysisResult } from "@/lib/contracts/analysis";

/** Held in React memory only. Never written to localStorage, IndexedDB, cookies, or a database. */
export type SessionDocument = {
  id: string;
  displayName: string;
  language: LanguageCode;
  analysis: AnalysisResult;
  analyzedAt: string;
};
