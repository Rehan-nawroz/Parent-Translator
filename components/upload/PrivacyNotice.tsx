import { Lock } from "lucide-react";

export function PrivacyNotice() {
  return (
    <div className="rounded-xl border border-line bg-ink/50 p-4">
      <p className="flex items-start gap-3 text-xs leading-relaxed text-muted">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-white">Private by default.</strong> Your document is
          read for this one request and is not saved. The brief stays in this tab until you clear
          the session. We never ask for your child&apos;s name, school, or student ID.
        </span>
      </p>
    </div>
  );
}
