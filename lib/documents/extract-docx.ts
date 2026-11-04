import mammoth from "mammoth";

import { createTextSource, extractionFailure } from "./factory";
import { normalizeExtractedText } from "./normalize";
import type { ExtractionResult } from "./types";
import type { ValidatedUpload } from "./validate-upload";

export async function extractDocxText(upload: ValidatedUpload): Promise<ExtractionResult> {
  try {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(upload.bytes) });
    const text = normalizeExtractedText(result.value ?? "");

    if (text.length === 0) return extractionFailure("DOCUMENT_UNREADABLE");

    return {
      ok: true,
      document: createTextSource({
        displayName: upload.displayName,
        extension: upload.extension,
        mimeType: upload.mimeType,
        pages: [{ pageNumber: 1, text }],
      }),
    };
  } catch {
    return extractionFailure("DOCUMENT_UNREADABLE");
  }
}
