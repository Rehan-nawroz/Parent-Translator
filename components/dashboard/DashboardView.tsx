"use client";

import { ArrowRight, CalendarDays, FileText, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSession } from "@/lib/session/session-store";
import { formatIsoDate } from "@/lib/utils/dates";
import { maskEmail } from "@/lib/utils/text";

import { UsageIndicator } from "./UsageIndicator";

export function DashboardView({
  email,
  remaining,
  limit,
}: {
  email: string | null;
  remaining: number;
  limit: number;
}) {
  const router = useRouter();
  const { documents, setCurrentDocument, timeline } = useSession();
  const empty = documents.length === 0;
  const percent = limit > 0 ? Math.max(0, Math.min(100, (remaining / limit) * 100)) : 0;
  const shortEmail = email ? maskEmail(email).split("@")[0]?.slice(0, 5) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back{shortEmail ? `, ${shortEmail}` : ""}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Analyze a school document and read the four-part brief in your language. Nothing is
            saved after the request.
          </p>
        </div>
        <UsageIndicator remaining={remaining} limit={limit} />
      </header>

      <Card className="rounded-panel p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-white">
              {remaining} of {limit} analyses remaining
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              This three-analysis limit is a temporary rule. Each account starts with three; failed
              or invalid requests do not use one.
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-crimson to-ruby transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {remaining > 0 ? (
              <Link href="/dashboard/upload" className={buttonClasses("primary", "md")}>
                Upload a document
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <Link href="/dashboard/limit-reached" className={buttonClasses("secondary", "md")}>
                View limit reached
              </Link>
            )}
            <Link href="/dashboard/timeline" className={buttonClasses("secondary", "md")}>
              Timeline
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Current session</h2>
            <span className="text-xs text-muted">
              {documents.length} document{documents.length === 1 ? "" : "s"}
            </span>
          </div>

          {empty ? (
            <div className="mt-5 rounded-xl border border-dashed border-line-strong p-6 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-crimson/10 text-crimson">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-medium text-white">No documents yet</p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted">
                Start with a report card, IEP notice, newsletter, permission slip, or teacher email.
              </p>
              <Link href="/dashboard/upload" className={buttonClasses("primary", "sm", "mt-4")}>
                Upload your first document
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {documents.map((document) => (
                <li key={document.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentDocument(document.id);
                      router.push("/dashboard/result");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg border border-line bg-ink/40 p-3 text-left transition hover:border-crimson/40 hover:bg-obsidian"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-crimson/10 text-crimson">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">
                        {document.displayName}
                      </span>
                      <span className="block text-xs text-muted">
                        {new Date(document.analyzedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="rounded-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Deadlines</h2>
            <Link
              href="/dashboard/timeline"
              className="text-xs text-ember underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          {timeline.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Deadlines appear here after a successful analysis. Only dates stated in the document
              are added.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {timeline.slice(0, 3).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 rounded-lg border border-line bg-ink/40 px-3 py-2.5"
                >
                  <span className="mt-0.5 text-muted">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p lang={entry.language} className="truncate text-xs font-medium text-white">
                      {entry.title}
                    </p>
                    <p className="truncate text-[11px] text-muted">
                      {entry.date ? formatIsoDate(entry.date, entry.language) : entry.dateDisplay} ·{" "}
                      {entry.documentName}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-obsidian/50 px-4 py-3 text-xs text-muted">
        <span className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-crimson" aria-hidden="true" />
          Results are held in this tab only and are never saved to a document history.
        </span>
        <Link href="/dashboard/account" className={buttonClasses("ghost", "sm")}>
          Account &amp; session
        </Link>
      </div>
    </div>
  );
}
