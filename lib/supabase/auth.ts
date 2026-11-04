import { createSupabaseServerClient } from "./server";

/** Minimal identity shape. Never pass raw Supabase user objects into client components. */
export type AuthUser = { id: string; email: string | null };

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? null };
}
