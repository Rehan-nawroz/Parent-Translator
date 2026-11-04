import { redirect } from "next/navigation";

import { ConsentGate } from "@/components/dashboard/ConsentGate";
import { ProtectedNavigation } from "@/components/dashboard/ProtectedNavigation";
import { MAX_ANALYSES_PER_USER } from "@/lib/config/limits";
import { isSupabaseConfigured } from "@/lib/config/public";
import { SessionProvider } from "@/lib/session/session-store";
import { getCurrentUser } from "@/lib/supabase/auth";
import { readConsent } from "@/lib/supabase/consent";
import { readUsage } from "@/lib/supabase/usage";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) redirect("/auth/sign-in");

  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const consent = await readConsent(user.id);
  if (!consent || !consent.recorded) return <ConsentGate />;

  const usage = await readUsage(user.id);

  return (
    <div className="flex min-h-dvh flex-col">
      <ProtectedNavigation
        email={user.email}
        remaining={usage?.remainingAnalyses ?? 0}
        limit={usage?.limit ?? MAX_ANALYSES_PER_USER}
      />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <SessionProvider>{children}</SessionProvider>
      </main>
      <footer className="border-t border-line px-4 py-5">
        <p className="mx-auto max-w-7xl text-center text-xs text-muted lg:text-left">
          Documents are processed for the current request and are not saved. Results stay in this
          tab until you clear the session. Parent Translator is not legal advice.
        </p>
      </footer>
    </div>
  );
}
