import type { SupportedExtension } from "@/lib/config/limits";
import type { ErrorCode } from "@/lib/contracts/errors";

/** "vision" documents are passed to the model as binary; no local text exists for them. */
export type SourceKind = "text" | "vision";

export type SourcePage = {
  pageNumber: number;
  text: string;
};

export type SourceDocument = {
  displayName: string;
  extension: SupportedExtension;
  mimeType: string;
  kind: SourceKind;
  /** Text pages for "text" sources; empty for "vision" sources. */
  pages: SourcePage[];
  text: string;
  /** Ephemeral bytes for "vision" sources. Cleared by cleanup in every request path. */
  bytes: Uint8Array | null;
  pageCount: number;
  charCount: number;
};

export type ExtractionFailure = { ok: false; code: ErrorCode };
export type ExtractionSuccess = { ok: true; document: SourceDocument };
export type ExtractionResult = ExtractionSuccess | ExtractionFailure;
