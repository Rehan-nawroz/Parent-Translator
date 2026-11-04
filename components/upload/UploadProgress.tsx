import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const STAGES = [
  "Uploading securely for this request",
  "Reading the document",
  "Preparing the plain-language brief",
  "Checking the result",
];

export function UploadProgress({ stage }: { stage: number }) {
  return (
    <div className="rounded-xl border border-crimson/25 bg-crimson/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ember">
        Working on your document
      </p>
      <ol className="mt-3 space-y-2.5">
        {STAGES.map((label, index) => {
          const done = index < stage;
          const active = index === stage;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  done
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : active
                      ? "border-crimson/50 bg-crimson/15 text-crimson"
                      : "border-line text-muted",
                )}
              >
                {done ? (
                  <Check className="h-3 w-3" aria-hidden="true" />
                ) : active ? (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                ) : (
                  <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
                )}
              </span>
              <span className={done || active ? "text-white" : "text-muted"}>{label}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Do not close this tab while the request is active. A failed request restores its credit.
      </p>
    </div>
  );
}
