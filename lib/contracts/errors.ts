/**
 * Stable, safe error codes for API routes.
 *
 * Codes are part of the contract: the client switches on them, so they must not be renamed
 * casually. Messages are what a parent reads, so they stay plain, blame-free and free of
 * provider names, stack traces, prompts, or internal details.
 */

export const ERROR_CODES = [
  "INVALID_REQUEST",
  "MISSING_FILE",
  "EMPTY_FILE",
  "UNSUPPORTED_FILE",
  "FILE_TOO_LARGE",
  "INVALID_LANGUAGE",
  "UNAUTHENTICATED",
  "CONSENT_REQUIRED",
  "QUOTA_EXHAUSTED",
  "RATE_LIMITED",
  "DOCUMENT_UNREADABLE",
  "PROVIDER_UNAVAILABLE",
  "INVALID_AI_RESPONSE",
  "INTERNAL_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const ERROR_STATUS: Record<ErrorCode, number> = {
  INVALID_REQUEST: 400,
  MISSING_FILE: 400,
  EMPTY_FILE: 400,
  INVALID_LANGUAGE: 400,
  UNAUTHENTICATED: 401,
  CONSENT_REQUIRED: 403,
  FILE_TOO_LARGE: 413,
  UNSUPPORTED_FILE: 415,
  DOCUMENT_UNREADABLE: 422,
  QUOTA_EXHAUSTED: 429,
  RATE_LIMITED: 429,
  INVALID_AI_RESPONSE: 502,
  PROVIDER_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

const ERROR_MESSAGE: Record<ErrorCode, string> = {
  INVALID_REQUEST: "We could not read that request. Please try again.",
  MISSING_FILE: "Please choose a document to upload.",
  EMPTY_FILE: "That file is empty. Please choose a different document.",
  UNSUPPORTED_FILE:
    "That file type is not supported yet. Upload a PDF, Word document, image, or text file.",
  FILE_TOO_LARGE: "That file is too large. Please upload a smaller document.",
  INVALID_LANGUAGE: "That language is not available yet. Please choose one from the list.",
  UNAUTHENTICATED: "Please sign in to explain a document.",
  CONSENT_REQUIRED: "Please accept the Terms and Privacy Policy to continue.",
  QUOTA_EXHAUSTED: "You have used all three analyses available for this demo.",
  RATE_LIMITED: "Too many requests in a short time. Please wait a moment and try again.",
  DOCUMENT_UNREADABLE:
    "We could not read any text from that document. Try a clearer copy or a different file.",
  PROVIDER_UNAVAILABLE:
    "The analysis service is unavailable right now. Please try again in a moment.",
  INVALID_AI_RESPONSE:
    "We could not produce a reliable brief from that document. Please try again, or try a different document.",
  INTERNAL_ERROR: "Something went wrong on our side. Please try again.",
};

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && (ERROR_CODES as readonly string[]).includes(value);
}

export function statusForErrorCode(code: ErrorCode): number {
  return ERROR_STATUS[code];
}

export function messageForErrorCode(code: ErrorCode): string {
  return ERROR_MESSAGE[code];
}
