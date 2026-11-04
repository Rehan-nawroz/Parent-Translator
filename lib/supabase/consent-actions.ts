"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "./auth";
import { recordConsent } from "./consent";

export async function acceptPoliciesAction(): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };

  const result = await recordConsent(user.id);
  if (result !== "recorded") return { ok: false };

  revalidatePath("/dashboard");
  return { ok: true };
}
