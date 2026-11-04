import { Quote } from "lucide-react";

import type { Citation } from "@/lib/contracts/analysis";

export function CitationBadge({ citation }: { citation?: Citation | null }) {
  if (!citation) return null;

  const location =
    [citation.page ? `Page ${citation.page}` : null, citation.section]
      .filter(Boolean)
      .join(" · ") || citation.sourceLabel;

  return (
    <details className="relative inline-block">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-line bg-white/5 px-2 py-1 text-[10px] font-medium text-muted transition hover:border-crimson/40 hover:text-white">
        <Quote className="h-3 w-3" aria-hidden="true" />
        {location}
      </summary>
      <div className="mt-2 max-w-sm rounded-lg border border-line bg-obsidian p-3 text-xs shadow-xl">
        <p className="leading-relaxed text-mist/85">&ldquo;{citation.quote}&rdquo;</p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted">
          {citation.sourceLabel}
        </p>
      </div>
    </details>
  );
}
