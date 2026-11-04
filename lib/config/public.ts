/**
 * Client-safe public configuration.
 *
 * Only values that are safe to inline in the browser bundle belong here. The Supabase anon key is
 * designed to be public; row-level security protects the data.
 */

import { MAX_ANALYSES_PER_USER, MAX_UPLOAD_BYTES } from "./limits";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";

/**
 * Supabase renamed the browser key: newer projects issue a "publishable" key, older ones an
 * "anon" key. Both are safe to ship and both are accepted here.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";

export const isSupabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

export const TERMS_VERSION = "2026-11-01";
export const PRIVACY_VERSION = "2026-11-01";

export const USAGE_LIMIT = MAX_ANALYSES_PER_USER;
export const UPLOAD_LIMIT_BYTES = MAX_UPLOAD_BYTES;
