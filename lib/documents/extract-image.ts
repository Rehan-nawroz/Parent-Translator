import { createVisionSource } from "./factory";
import type { ExtractionResult } from "./types";
import type { ValidatedUpload } from "./validate-upload";

/**
 * Images are not OCR'd locally. They are passed to Gemini as an inline document part for a
 * single grounded pass, which avoids keeping a second full transcription in memory.
 */
export function extractImageAsVisionSource(upload: ValidatedUpload): ExtractionResult {
  return {
    ok: true,
    document: createVisionSource({
      displayName: upload.displayName,
      extension: upload.extension,
      mimeType: upload.mimeType,
      bytes: upload.bytes,
    }),
  };
}
