import type { LanguageCode } from "@/lib/config/languages";
import type { SourceDocument } from "@/lib/documents/types";

import { getGeminiClient } from "./client";
import { AiServiceError } from "./errors";
import { SYSTEM_INSTRUCTION, buildUserPrompt } from "./prompt";

const REQUEST_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 500;

type RequestPart = { text: string } | { inlineData: { mimeType: string; data: string } };

function buildParts(source: SourceDocument, language: LanguageCode): RequestPart[] {
  const parts: RequestPart[] = [{ text: buildUserPrompt({ language, source }) }];

  if (source.kind === "vision" && source.bytes) {
    parts.push({
      inlineData: {
        mimeType: source.mimeType,
        data: Buffer.from(source.bytes).toString("base64"),
      },
    });
  }

  return parts;
}

/**
 * Sends one grounded analysis request. Provider failures are retried once; validation failures are
 * not retried here, because a schema-invalid answer usually means a deterministic prompt problem.
 */
export async function requestAnalysis(input: {
  source: SourceDocument;
  language: LanguageCode;
}): Promise<string> {
  const gemini = getGeminiClient();
  if (!gemini) throw new AiServiceError("MISSING_CONFIG");

  const parts = buildParts(input.source, input.language);
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await gemini.client.models.generateContent({
        model: gemini.model,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          abortSignal: controller.signal,
        },
      });

      const text = response.text;
      if (!text || text.trim().length === 0) throw new AiServiceError("INVALID_OUTPUT");
      return text;
    } catch (error) {
      lastError = error;
      if (error instanceof AiServiceError) throw error;
      if (controller.signal.aborted) throw new AiServiceError("TIMEOUT");
      if (attempt === MAX_ATTEMPTS) break;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    } finally {
      clearTimeout(timer);
    }
  }

  throw new AiServiceError("PROVIDER_ERROR", { cause: lastError });
}
