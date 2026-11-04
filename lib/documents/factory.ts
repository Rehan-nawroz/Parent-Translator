import type { ErrorCode } from "@/lib/contracts/errors";

import type { ExtractionFailure, SourceDocument, SourcePage } from "./types";

type TextSourceInput = {
  displayName: string;
  extension: SourceDocument["extension"];
  mimeType: string;
  pages: SourcePage[];
};

export function createTextSource(input: TextSourceInput): SourceDocument {
  const text = input.pages.map((page) => page.text).join("\n\n");
  return {
    displayName: input.displayName,
    extension: input.extension,
    mimeType: input.mimeType,
    kind: "text",
    pages: input.pages,
    text,
    bytes: null,
    pageCount: input.pages.length,
    charCount: text.length,
  };
}

export function createVisionSource(input: {
  displayName: string;
  extension: SourceDocument["extension"];
  mimeType: string;
  bytes: Uint8Array;
}): SourceDocument {
  return {
    displayName: input.displayName,
    extension: input.extension,
    mimeType: input.mimeType,
    kind: "vision",
    pages: [],
    text: "",
    bytes: input.bytes,
    pageCount: 1,
    charCount: 0,
  };
}

export function extractionFailure(code: ErrorCode): ExtractionFailure {
  return { ok: false, code };
}
