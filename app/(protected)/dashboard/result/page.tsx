import { redirect } from "next/navigation";

import { ResultWorkspace } from "@/components/results/ResultWorkspace";
import { MAX_ANALYSES_PER_USER } from "@/lib/config/limits";
import { getCurrentUser } from "@/lib/supabase/auth";
import { readUsage } from "@/lib/supabase/usage";

export const metadata = { title: "Your brief" };

export default async function ResultPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const usage = await readUsage(user.id);

  return (
    <ResultWorkspace
      remaining={usage?.remainingAnalyses ?? 0}
      limit={usage?.limit ?? MAX_ANALYSES_PER_USER}
    />
  );
}
