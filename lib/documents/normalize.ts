import { normalizeWhitespace } from "@/lib/utils/text";

/**
 * Normalizes extracted text without touching meaningful characters. Only spacing artifacts,
 * non-breaking spaces, and soft hyphens are changed; dates, grades, acronyms, currency, and table
 * values are preserved.
 */
export function normalizeExtractedText(raw: string): string {
  return normalizeWhitespace(raw.replace(/\u00a0/g, " ").replace(/\u00ad/g, ""));
}
