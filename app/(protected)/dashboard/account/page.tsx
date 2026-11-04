import Link from "next/link";
import { redirect } from "next/navigation";

import { ClearSessionButton } from "@/components/session/ClearSessionButton";
import { Card } from "@/components/ui/Card";
import { MAX_ANALYSES_PER_USER } from "@/lib/config/limits";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/config/public";
import { getCurrentUser } from "@/lib/supabase/auth";
import { readConsent } from "@/lib/supabase/consent";
import { readUsage } from "@/lib/supabase/usage";
import { maskEmail } from "@/lib/utils/text";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const [usage, consent] = await Promise.all([readUsage(user.id), readConsent(user.id)]);
  const remaining = usage?.remainingAnalyses ?? 0;
  const limit = usage?.limit ?? MAX_ANALYSES_PER_USER;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Your account &amp; session</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Only the account email, policy acceptance, and analysis count are stored. No document
          content is kept.
        </p>
      </header>

      <Card className="rounded-panel p-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-muted">Email</dt>
            <dd className="mt-1 text-sm font-medium text-white">
              {user.email ? maskEmail(user.email) : "Not available"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-muted">Remaining analyses</dt>
            <dd className="mt-1 text-sm font-medium text-white">
              {remaining} of {limit}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-muted">Terms version</dt>
            <dd className="mt-1 text-sm font-medium text-white">
              {consent?.termsVersion ?? "Not recorded"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-muted">Privacy version</dt>
            <dd className="mt-1 text-sm font-medium text-white">
              {consent?.privacyVersion ?? "Not recorded"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="rounded-panel p-6">
        <h2 className="text-lg font-semibold text-white">Session controls</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Results and timeline entries live in this tab only. Clearing the session removes them from
          memory. It does not reset the three-analysis account limit.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ClearSessionButton />
          <Link
            href="/dashboard"
            className="text-xs text-muted underline underline-offset-4 transition hover:text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </Card>

      <Card className="rounded-panel p-6">
        <h2 className="text-lg font-semibold text-white">Policies</h2>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy" className="text-ember underline underline-offset-4">
            Privacy Notice ({PRIVACY_VERSION})
          </Link>
          <Link href="/terms" className="text-ember underline underline-offset-4">
            Terms of Use ({TERMS_VERSION})
          </Link>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Sign out from the control in the top navigation. Parent Translator explains documents; it
          is not legal advice.
        </p>
      </Card>
    </div>
  );
}
