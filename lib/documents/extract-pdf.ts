import { extractText, getDocumentProxy } from "unpdf";

import { createTextSource, extractionFailure } from "./factory";
import { normalizeExtractedText } from "./normalize";
import type { ExtractionResult } from "./types";
import type { ValidatedUpload } from "./validate-upload";

export async function extractPdfText(upload: ValidatedUpload): Promise<ExtractionResult> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(upload.bytes));
    const { text } = await extractText(pdf, { mergePages: false });
    const rawPages: string[] = Array.isArray(text) ? text : [text];

    const pages = rawPages.map((value, index) => ({
      pageNumber: index + 1,
      text: normalizeExtractedText(value ?? ""),
    }));

    if (pages.length === 0 || pages.every((page) => page.text.length === 0)) {
      return extractionFailure("DOCUMENT_UNREADABLE");
    }

    return {
      ok: true,
      document: createTextSource({
        displayName: upload.displayName,
        extension: upload.extension,
        mimeType: upload.mimeType,
        pages,
      }),
    };
  } catch {
    return extractionFailure("DOCUMENT_UNREADABLE");
  }
}
