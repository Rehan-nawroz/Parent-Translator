import type { SourceDocument } from "./types";

/**
 * Drops and overwrites request-scoped buffers. Extraction never writes to disk, so cleanup is a
 * memory operation performed in a `finally` block on both success and failure.
 */
export function disposeSource(source: SourceDocument | null | undefined): void {
  if (!source) return;

  if (source.bytes) source.bytes.fill(0);
  for (const page of source.pages) page.text = "";
  source.pages.length = 0;
  source.text = "";
  source.bytes = null;
  source.charCount = 0;
}
