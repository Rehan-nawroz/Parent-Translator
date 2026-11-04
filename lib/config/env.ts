/**
 * Server-side environment access.
 *
 * Never import this module from a client component for secret values. Public values live in
 * `lib/config/public.ts` and use the `NEXT_PUBLIC_` prefix so Next.js can inline them safely.
 */

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";
export const TERMS_VERSION = process.env.TERMS_VERSION?.trim() || "2026-11-01";
export const PRIVACY_VERSION = process.env.PRIVACY_VERSION?.trim() || "2026-11-01";

function readPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getMaxUploadBytes(): number {
  return readPositiveInt(process.env.MAX_UPLOAD_BYTES, 10 * 1024 * 1024);
}

export function getMaxAnalysesPerUser(): number {
  return readPositiveInt(process.env.MAX_ANALYSES_PER_USER, 3);
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export type GeminiConfig = { apiKey: string; model: string };

/** Returns null instead of throwing so the API can answer with a safe configuration error. */
export function getGeminiConfig(): GeminiConfig | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey, model: getGeminiModel() };
}

export type SupabaseAdminConfig = { url: string; serviceRoleKey: string };

export function getSupabaseAdminConfig(): SupabaseAdminConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}
