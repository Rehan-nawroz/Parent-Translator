"use client";

import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

import { ClearSessionButton } from "@/components/session/ClearSessionButton";
import { buttonClasses } from "@/components/ui/Button";
import { getLanguageOption } from "@/lib/config/languages";
import { useSession } from "@/lib/session/session-store";

import { AnalysisView } from "./AnalysisView";

export function ResultWorkspace({ remaining, limit }: { remaining: number; limit: number }) {
  const { currentDocument, documents } = useSession();

  if (!currentDocument) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-crimson/25 bg-crimson/10 text-crimson">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">No brief in this session yet</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          Upload a school document to see the four-part brief. Results stay in this tab and are not
          saved after the request.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {remaining > 0 ? (
            <Link href="/dashboard/upload" className={buttonClasses("primary", "md")}>
              Upload a document
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Your plain-language brief
          </h1>
          <p className="mt-1 text-sm text-muted">
            {currentDocument.displayName} ·{" "}
            {getLanguageOption(currentDocument.language).nativeLabel} · {documents.length} document
            {documents.length === 1 ? "" : "s"} in session · {remaining} of {limit} analyses left
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {remaining > 0 && (
            <Link href="/dashboard/upload" className={buttonClasses("primary", "sm")}>
              Analyze another
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
          <Link href="/dashboard/timeline" className={buttonClasses("secondary", "sm")}>
            Timeline
          </Link>
          <ClearSessionButton />
        </div>
      </div>

      <AnalysisView
        analysis={currentDocument.analysis}
        documentName={currentDocument.displayName}
        languageLabel={getLanguageOption(currentDocument.language).nativeLabel}
      />
    </div>
  );
}
