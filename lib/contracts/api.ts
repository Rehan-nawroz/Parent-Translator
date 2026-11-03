import { z } from "zod";

import { LANGUAGE_CODES } from "@/lib/config/languages";

import { analysisResultSchema } from "./analysis-schema";
import { ERROR_CODES, messageForErrorCode, type ErrorCode } from "./errors";

/**
 * The `/api/analyze` contract: request fields, success envelope, error envelope.
 *
 * Both envelopes carry a request ID so a parent can quote it in support and so server logs can
 * be correlated without ever logging document content.
 */

/** Text fields of the multipart request. The file itself is validated by the upload layer. */
export const analyzeRequestSchema = z.object({
  language: z.enum(LANGUAGE_CODES),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const analyzeErrorResponseSchema = z.object({
  ok: z.literal(false),
  requestId: z.string().trim().min(1),
  error: z.object({
    code: z.enum(ERROR_CODES),
    message: z.string().trim().min(1),
  }),
});

export type AnalyzeErrorResponse = z.infer<typeof analyzeErrorResponseSchema>;

export const analyzeSuccessResponseSchema = z
  .object({
    ok: z.literal(true),
    requestId: z.string().trim().min(1),
    document: z.object({
      displayName: z.string().trim().min(1).max(200),
    }),
    analysis: analysisResultSchema,
    usage: z.object({
      remainingAnalyses: z.number().int().min(0),
      limit: z.number().int().min(1),
    }),
  })
  .refine((response) => response.usage.remainingAnalyses <= response.usage.limit, {
    path: ["usage", "remainingAnalyses"],
    message: "Remaining analyses cannot exceed the limit.",
  });

export type AnalyzeSuccessResponse = z.infer<typeof analyzeSuccessResponseSchema>;

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;

/** Builds the error envelope with the safe message for the code. HTTP status is separate. */
export function createAnalyzeErrorResponse(
  code: ErrorCode,
  requestId: string,
): AnalyzeErrorResponse {
  return {
    ok: false,
    requestId,
    error: { code, message: messageForErrorCode(code) },
  };
}
