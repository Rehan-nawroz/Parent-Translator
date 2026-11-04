import { redirect } from "next/navigation";

import { UploadPanel } from "@/components/upload/UploadPanel";
import { MAX_ANALYSES_PER_USER } from "@/lib/config/limits";
import { getCurrentUser } from "@/lib/supabase/auth";
import { readUsage } from "@/lib/supabase/usage";

export const metadata = { title: "Upload a document" };

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const usage = await readUsage(user.id);

  return (
    <UploadPanel
      remaining={usage?.remainingAnalyses ?? 0}
      limit={usage?.limit ?? MAX_ANALYSES_PER_USER}
    />
  );
}
