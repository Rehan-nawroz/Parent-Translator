"use client";

import { CalendarDays, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CitationBadge } from "@/components/results/CitationBadge";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getLanguageOption } from "@/lib/config/languages";
import type { DeadlineDateKind } from "@/lib/contracts/analysis";
import { useSession } from "@/lib/session/session-store";
import { formatIsoDate } from "@/lib/utils/dates";

const KIND_LABELS: Record<DeadlineDateKind, string> = {
  exact: "Exact date",
  range: "Date range",
  recurring: "Recurring",
  unclear: "Unclear date",
};

export function TimelineView({ remaining }: { remaining: number }) {
  const { timeline, setCurrentDocument } = useSession();
  const router = useRouter();

  if (timeline.length === 0) {
    return (
      <Card className="rounded-panel p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-crimson/25 bg-crimson/10 text-crimson">
          <CalendarDays className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-white">No deadlines in this session yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          Deadlines appear here after you analyze a document. Only dates the document states are
          added; ambiguous wording stays off the calendar.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {remaining > 0 ? (
            <Link href="/dashboard/upload" className={buttonClasses("primary", "md")}>
              Upload a document
            </Link>
          ) : (
            <Link href="/dashboard/limit-reached" className={buttonClasses("secondary", "md")}>
              See your limit
            </Link>
          )}
          <Link href="/dashboard" className={buttonClasses("secondary", "md")}>
            Dashboard
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {timeline.map((entry) => (
        <li
          key={entry.id}
          dir={getLanguageOption(entry.language).direction}
          className="rounded-xl border border-line bg-obsidian/60 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-crimson/10 text-crimson">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p lang={entry.language} className="text-sm font-semibold text-white">
                  {entry.title}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {entry.date ? formatIsoDate(entry.date, entry.language) : entry.dateDisplay} ·{" "}
                  {KIND_LABELS[entry.dateKind]}
                </p>
                <p className="mt-1 text-[11px] text-muted">From {entry.documentName}</p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-line bg-white/5 px-2.5 py-1 text-[10px] font-medium text-muted">
              {entry.hasStatedDeadline ? "On the calendar" : "Not on a calendar date"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <CitationBadge citation={entry.citation} />
            <button
              type="button"
              onClick={() => {
                setCurrentDocument(entry.documentId);
                router.push("/dashboard/result");
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-ember underline underline-offset-4 transition hover:text-white"
            >
              Open source result
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
