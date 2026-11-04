import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdminConfig } from "@/lib/config/env";

/**
 * SERVER-ONLY. This client bypasses row-level security and must never be imported into a client
 * component or shipped in a browser bundle.
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  const config = getSupabaseAdminConfig();
  if (!config) return null;

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
