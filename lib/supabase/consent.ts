import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/config/env";

import { createSupabaseServerClient } from "./server";

export type ConsentStatus = {
  recorded: boolean;
  termsVersion: string | null;
  privacyVersion: string | null;
};

export async function readConsent(userId: string): Promise<ConsentStatus | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_consents")
    .select("terms_version, privacy_version")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  if (!data) return { recorded: false, termsVersion: null, privacyVersion: null };

  const termsVersion = typeof data.terms_version === "string" ? data.terms_version : null;
  const privacyVersion = typeof data.privacy_version === "string" ? data.privacy_version : null;

  return {
    recorded: termsVersion === TERMS_VERSION && privacyVersion === PRIVACY_VERSION,
    termsVersion,
    privacyVersion,
  };
}

/**
 * Records acceptance for the current policy versions. Only user ID, versions, and a timestamp are
 * stored. Returns "recorded" for an existing row as well, since consent is immutable per version.
 */
export async function recordConsent(
  userId: string,
): Promise<"recorded" | "failed" | "unconfigured"> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return "unconfigured";

  const { error } = await supabase.from("user_consents").insert({
    user_id: userId,
    terms_version: TERMS_VERSION,
    privacy_version: PRIVACY_VERSION,
  });

  if (!error) return "recorded";
  if (error.code === "23505") return "recorded";
  return "failed";
}
