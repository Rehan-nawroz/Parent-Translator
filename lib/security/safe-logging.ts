/**
 * Safe request logging.
 *
 * Only allowlisted, low-cardinality fields are ever printed. Document text, filenames, prompts,
 * model output, emails, and provider error bodies must never reach a log line.
 */

export type SafeLogEvent = {
  event: string;
  requestId?: string;
  outcome?: "success" | "failure" | "rejected";
  errorCode?: string;
  durationMs?: number;
  status?: number;
  promptVersion?: string;
};

const ALLOWED_KEYS: readonly (keyof SafeLogEvent)[] = [
  "event",
  "requestId",
  "outcome",
  "errorCode",
  "durationMs",
  "status",
  "promptVersion",
];

export function logSafeEvent(entry: SafeLogEvent): void {
  const record: Record<string, string | number> = {};
  for (const key of ALLOWED_KEYS) {
    const value = entry[key];
    if (value === undefined) continue;
    record[key] = typeof value === "string" ? value.slice(0, 80) : Math.trunc(value);
  }
  console.info(`[parent-translator] ${JSON.stringify(record)}`);
}
