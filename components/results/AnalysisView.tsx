"use client";

import { CalendarDays, Copy, FileText, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

import { JargonPopover } from "@/components/jargon/JargonPopover";
import { JargonTerm } from "@/components/jargon/JargonTerm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getLanguageOption, type LanguageCode } from "@/lib/config/languages";
import type {
  ActionDeadlineStatus,
  AnalysisResult,
  Certainty,
  Citation,
  DeadlineDateKind,
} from "@/lib/contracts/analysis";
import { formatIsoDate } from "@/lib/utils/dates";

import { CitationBadge } from "./CitationBadge";
import { SafetyNotice } from "./SafetyNotice";

const CERTAINTY_LABELS: Record<Certainty, string> = {
  explicit: "Stated in the document",
  supported_interpretation: "Cautious interpretation",
  unclear: "Unclear",
};

const STATUS_LABELS: Record<ActionDeadlineStatus, string> = {
  deadline_found: "Deadline stated",
  no_deadline_found: "No deadline found",
  unclear: "Deadline unclear",
};

const KIND_LABELS: Record<DeadlineDateKind, string> = {
  exact: "Exact date",
  range: "Date range",
  recurring: "Recurring",
  unclear: "Unclear date",
};

function CitationList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {citations.map((citation, index) => (
        <CitationBadge key={`${citation.quote}-${index}`} citation={citation} />
      ))}
    </div>
  );
}

function SectionCard({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-card p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-ink/60 text-xs font-bold text-ember">
          {number}
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export function AnalysisView({
  analysis,
  documentName,
  language,
  languageLabel,
}: {
  analysis: AnalysisResult;
  documentName: string;
  language: LanguageCode;
  languageLabel: string;
}) {
  const direction = getLanguageOption(language).direction;
  const [activeJargon, setActiveJargon] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const active = activeJargon === null ? null : (analysis.jargon[activeJargon] ?? null);

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(analysis.whatToAskTheSchool.draftEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-6 space-y-4" dir={direction}>
      <Card className="rounded-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-crimson/10 text-crimson">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Document</p>
              <p className="text-sm font-semibold text-white">{documentName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-full border border-line bg-white/5 px-2.5 py-1 text-muted">
              {languageLabel}
            </span>
            <span className="rounded-full border border-crimson/25 bg-crimson/5 px-2.5 py-1 text-ember">
              {analysis.document.documentType ?? "School document"}
            </span>
          </div>
        </div>
      </Card>

      <SectionCard
        number="01"
        title="What this says"
        subtitle="A plain-language summary of this document"
      >
        <p lang={language} className="text-[15px] leading-relaxed text-mist/90">
          {analysis.whatThisSays.summary}
        </p>
        <CitationList citations={analysis.whatThisSays.citations} />
      </SectionCard>

      <SectionCard
        number="02"
        title="What it means for your child"
        subtitle="Cautious meaning grounded in the document"
      >
        <ul className="space-y-3">
          {analysis.whatItMeansForYourChild.points.map((point, index) => (
            <li
              key={`${point.text}-${index}`}
              className="rounded-lg border border-line bg-ink/40 p-4"
            >
              <span className="rounded-full border border-line bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted">
                {CERTAINTY_LABELS[point.certainty]}
              </span>
              <p lang={language} className="mt-2 text-sm leading-relaxed text-mist/85">
                {point.text}
              </p>
              <CitationList citations={point.citations} />
            </li>
          ))}
        </ul>

        {analysis.whatItMeansForYourChild.uncertaintyNotes.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-200">
              Still uncertain
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-amber-100/85">
              {analysis.whatItMeansForYourChild.uncertaintyNotes.map((note) => (
                <li key={note} lang={language}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
        <CitationList citations={analysis.whatItMeansForYourChild.citations} />
      </SectionCard>

      <SectionCard
        number="03"
        title="What you need to do"
        subtitle="Actions and dates the document actually states"
      >
        {analysis.whatYouNeedToDo.actions.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted">
            This document did not state an action for you.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {analysis.whatYouNeedToDo.actions.map((action, index) => (
              <li
                key={`${action.action}-${index}`}
                className="rounded-lg border border-line bg-ink/40 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-line bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted">
                    {STATUS_LABELS[action.status]}
                  </span>
                  {action.dueDateDisplay && (
                    <span className="text-[11px] text-muted">{action.dueDateDisplay}</span>
                  )}
                </div>
                <p lang={language} className="mt-2 text-sm font-medium text-white">
                  {action.action}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {action.responsibleParty
                    ? `Responsible: ${action.responsibleParty}`
                    : "Who acts next was not stated."}
                </p>
                <CitationList citations={action.citations} />
              </li>
            ))}
          </ul>
        )}
        <CitationList citations={analysis.whatYouNeedToDo.citations} />
      </SectionCard>

      <SectionCard
        number="04"
        title="What to ask the school"
        subtitle="Questions written for this document"
      >
        <ol className="space-y-3">
          {analysis.whatToAskTheSchool.questions.map((question, index) => (
            <li
              key={`${question.question}-${index}`}
              className="rounded-lg border border-line bg-ink/40 p-4"
            >
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-crimson/10 text-[11px] font-semibold text-crimson">
                  {index + 1}
                </span>
                <div>
                  <p lang={language} className="text-sm font-medium text-white">
                    {question.question}
                  </p>
                  <p lang={language} className="mt-1 text-xs leading-relaxed text-muted">
                    {question.reason}
                  </p>
                  <CitationList citations={question.citations} />
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-xl border border-line bg-ink/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Draft email</h3>
            <Button size="sm" variant="secondary" onClick={copyDraft}>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              {copied ? "Copied" : "Copy draft"}
            </Button>
          </div>
          <p aria-live="polite" className="sr-only">
            {copied ? "Draft email copied to clipboard." : ""}
          </p>
          <p
            lang={language}
            className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-mist/85"
          >
            {analysis.whatToAskTheSchool.draftEmail}
          </p>
          <p className="mt-3 text-[11px] text-muted">
            Copying never sends an email. Edit it in your own mail app before sending.
          </p>
        </div>
        <CitationList citations={analysis.whatToAskTheSchool.citations} />
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Sparkles className="h-4 w-4 text-crimson" aria-hidden="true" />
            Jargon decoder
          </h2>
          {analysis.jargon.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              No jargon terms were detected in this document.
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-muted">Tap a term for a one-sentence explanation.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.jargon.map((item, index) => (
                  <JargonTerm
                    key={`${item.term}-${index}`}
                    term={item.term}
                    expanded={activeJargon === index}
                    onClick={() => setActiveJargon(index)}
                  />
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="rounded-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <CalendarDays className="h-4 w-4 text-crimson" aria-hidden="true" />
            Dates found
          </h2>
          {analysis.deadlines.length === 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">
              No deadline was found in this document.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {analysis.deadlines.map((deadline, index) => (
                <li
                  key={`${deadline.title}-${index}`}
                  className="rounded-lg border border-line bg-ink/40 px-3 py-2.5"
                >
                  <p lang={language} className="text-xs font-medium text-white">
                    {deadline.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {deadline.date ? formatIsoDate(deadline.date, language) : deadline.dateDisplay}{" "}
                    · {KIND_LABELS[deadline.dateKind]}
                  </p>
                  <div className="mt-1">
                    <CitationBadge citation={deadline.sourceReference} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <SafetyNotice notes={analysis.safetyNotes} language={language} />

      <JargonPopover item={active} language={language} onClose={() => setActiveJargon(null)} />
    </div>
  );
}
