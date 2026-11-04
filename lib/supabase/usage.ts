import { getMaxAnalysesPerUser } from "@/lib/config/env";

import { createSupabaseAdminClient } from "./admin";

/**
 * The three-analysis quota is stored as minimal metadata only: user ID, used count, reserved
 * count, timestamps. All mutations go through SECURITY DEFINER functions that take an explicit
 * row lock, so concurrent requests cannot exceed the limit.
 */

export type UsageSummary = { remainingAnalyses: number; limit: number };
export type ReservationResult = { allowed: boolean; usage: UsageSummary };

type JsonObject = Record<string, unknown>;

function readNumber(data: unknown, key: string): number | null {
  if (!data || typeof data !== "object") return null;
  const value = (data as JsonObject)[key];
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}

function summarise(data: unknown, limit: number): UsageSummary | null {
  const remaining = readNumber(data, "remaining");
  if (remaining === null) return null;
  return { remainingAnalyses: Math.min(Math.max(remaining, 0), limit), limit };
}

export async function readUsage(userId: string): Promise<UsageSummary | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const limit = getMaxAnalysesPerUser();
  const { data, error } = await admin.rpc("read_analysis_usage", {
    p_user_id: userId,
    p_limit: limit,
  });
  if (error) return null;
  return summarise(data, limit);
}

export async function reserveAnalysis(userId: string): Promise<ReservationResult | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const limit = getMaxAnalysesPerUser();
  const { data, error } = await admin.rpc("reserve_analysis", {
    p_user_id: userId,
    p_limit: limit,
  });
  if (error) return null;

  const usage = summarise(data, limit);
  const allowed = Boolean(
    data && typeof data === "object" && (data as JsonObject).allowed === true,
  );
  if (!usage) return null;

  return { allowed, usage };
}

export async function finalizeAnalysis(userId: string): Promise<UsageSummary | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const limit = getMaxAnalysesPerUser();
  const { data, error } = await admin.rpc("finalize_analysis", {
    p_user_id: userId,
    p_limit: limit,
  });
  if (error) return null;
  return summarise(data, limit);
}

/** Releases a reservation after a retryable failure. Safe to call only once per reservation. */
export async function releaseAnalysis(userId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;

  const { error } = await admin.rpc("release_analysis", { p_user_id: userId });
  return !error;
}
