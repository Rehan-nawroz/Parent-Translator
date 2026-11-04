import { extractDocxText } from "./extract-docx";
import { extractImageAsVisionSource } from "./extract-image";
import { extractPdfText } from "./extract-pdf";
import { createTextSource, createVisionSource, extractionFailure } from "./factory";
import { normalizeExtractedText } from "./normalize";
import type { ExtractionResult } from "./types";
import type { ValidatedUpload } from "./validate-upload";

const MIN_TEXT_CHARS = 40;

/** Chooses a local text extractor, or the Gemini vision path for images and scanned PDFs. */
export async function extractDocument(upload: ValidatedUpload): Promise<ExtractionResult> {
  switch (upload.extension) {
    case "txt": {
      const text = normalizeExtractedText(new TextDecoder("utf-8").decode(upload.bytes));
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
    }

    case "docx":
      return extractDocxText(upload);

    case "pdf": {
      const result = await extractPdfText(upload);
      if (!result.ok) return result;
      // A PDF with almost no text layer is treated as scanned and sent through vision instead.
      if (result.document.charCount < MIN_TEXT_CHARS) {
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
      return result;
    }

    case "png":
    case "jpg":
    case "jpeg":
      return extractImageAsVisionSource(upload);

    default:
      return extractionFailure("UNSUPPORTED_FILE");
  }
}
