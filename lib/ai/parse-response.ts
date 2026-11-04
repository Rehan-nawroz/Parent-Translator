import type { AnalysisResult } from "@/lib/contracts/analysis";
import { analysisResultSchema } from "@/lib/contracts/analysis-schema";
import { countUngroundedCitations } from "@/lib/documents/source-references";
import type { SourceDocument } from "@/lib/documents/types";
import { stripJsonFence } from "@/lib/security/sanitize";

import { AiServiceError } from "./errors";

/**
 * Parses the provider answer conservatively. Anything that is not valid JSON, does not satisfy the
 * shared schema, or cites text that is not in the document is rejected rather than repaired.
 */
export function parseAnalysisResponse(raw: string, source: SourceDocument): AnalysisResult {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripJsonFence(raw));
  } catch {
    throw new AiServiceError("INVALID_OUTPUT");
  }

  const result = analysisResultSchema.safeParse(parsedJson);
  if (!result.success) throw new AiServiceError("INVALID_OUTPUT");

  if (countUngroundedCitations(result.data, source) > 0) {
    throw new AiServiceError("INVALID_OUTPUT");
  }

  return result.data;
}
