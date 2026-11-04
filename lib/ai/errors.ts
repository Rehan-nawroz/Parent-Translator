export type AiFailure = "MISSING_CONFIG" | "PROVIDER_ERROR" | "TIMEOUT" | "INVALID_OUTPUT";

/**
 * Internal failure type. The message never includes provider text, prompts, or document content;
 * routes map `failure` to a safe error code.
 */
export class AiServiceError extends Error {
  readonly failure: AiFailure;

  constructor(failure: AiFailure, options?: { cause?: unknown }) {
    super(`AI request failed: ${failure}`, options);
    this.name = "AiServiceError";
    this.failure = failure;
  }
}
