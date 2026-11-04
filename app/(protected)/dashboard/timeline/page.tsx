import { redirect } from "next/navigation";

import { UsageIndicator } from "@/components/dashboard/UsageIndicator";
import { TimelineView } from "@/components/timeline/TimelineView";
import { MAX_ANALYSES_PER_USER } from "@/lib/config/limits";
import { getCurrentUser } from "@/lib/supabase/auth";
import { readUsage } from "@/lib/supabase/usage";

export const metadata = { title: "Timeline" };

export default async function TimelinePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const usage = await readUsage(user.id);
  const remaining = usage?.remainingAnalyses ?? 0;
  const limit = usage?.limit ?? MAX_ANALYSES_PER_USER;

  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Session timeline</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Every deadline in one place
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Built from documents in this tab only. Each entry keeps its source citation, and unclear
            dates are never placed on a guessed day.
          </p>
        </div>
        <UsageIndicator remaining={remaining} limit={limit} />
      </header>

      <div className="mt-6">
        <TimelineView remaining={remaining} />
      </div>
    </div>
  );
}
