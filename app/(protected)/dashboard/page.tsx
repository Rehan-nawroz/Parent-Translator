import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard/DashboardView";
import { MAX_ANALYSES_PER_USER } from "@/lib/config/limits";
import { getCurrentUser } from "@/lib/supabase/auth";
import { readUsage } from "@/lib/supabase/usage";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const usage = await readUsage(user.id);

  return (
    <DashboardView
      email={user.email}
      remaining={usage?.remainingAnalyses ?? 0}
      limit={usage?.limit ?? MAX_ANALYSES_PER_USER}
    />
  );
}
