import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MAX_ANALYSES_PER_USER } from "@/lib/config/limits";
import { getCurrentUser } from "@/lib/supabase/auth";
import { readUsage } from "@/lib/supabase/usage";

export const metadata = { title: "Analysis limit reached" };

export default async function LimitReachedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const usage = await readUsage(user.id);
  const limit = usage?.limit ?? MAX_ANALYSES_PER_USER;
  const remaining = usage?.remainingAnalyses ?? 0;
  const used = Math.max(0, limit - remaining);

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card className="rounded-panel p-7 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-crimson/25 bg-crimson/10 text-crimson">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-5">Demo limit</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {used} of {limit} analyses used
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Every account gets three document analyses. This is not a payment problem and there is no
          upgrade or reset flow.
        </p>

        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-line bg-ink/40 p-4 text-left">
          <p className="text-xs leading-relaxed text-muted">
            Results and the timeline from this session stay available in this tab until you clear
            the session or close it. Your account and its analysis count remain.
          </p>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/dashboard/result" className={buttonClasses("primary", "md")}>
            View current result
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/dashboard/timeline" className={buttonClasses("secondary", "md")}>
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            View timeline
          </Link>
        </div>

        <p className="mt-5 text-xs text-muted">
          <Link href="/dashboard/account" className="text-ember underline underline-offset-4">
            Account and session
          </Link>
        </p>
      </Card>
    </div>
  );
}
