import type { Citation, DeadlineDateKind } from "@/lib/contracts/analysis";
import { normalizeForComparison } from "@/lib/utils/text";

import type { SessionDocument } from "./types";

export type TimelineEntry = {
  id: string;
  documentId: string;
  documentName: string;
  title: string;
  date: string | null;
  dateDisplay: string;
  dateKind: DeadlineDateKind;
  citation: Citation;
  hasStatedDeadline: boolean;
};

const KIND_ORDER: Record<DeadlineDateKind, number> = {
  exact: 0,
  range: 1,
  recurring: 2,
  unclear: 3,
};

function compareEntries(a: TimelineEntry, b: TimelineEntry): number {
  if (a.date && b.date) return a.date.localeCompare(b.date);
  if (a.date) return -1;
  if (b.date) return 1;
  const kind = KIND_ORDER[a.dateKind] - KIND_ORDER[b.dateKind];
  return kind !== 0 ? kind : a.title.localeCompare(b.title);
}

/**
 * Merges deadlines from every analyzed document in the active session. Entries are deduplicated
 * only when the same document, date, and action are confidently identical; two different documents
 * never collapse into one entry, so the source is always preserved.
 */
export function buildTimeline(documents: SessionDocument[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const seen = new Set<string>();

  for (const document of documents) {
    const analysis = document.analysis;

    analysis.deadlines.forEach((deadline, index) => {
      const key = `${document.id}|${deadline.date ?? "none"}|${normalizeForComparison(deadline.title)}`;
      if (seen.has(key)) return;
      seen.add(key);

      entries.push({
        id: `${document.id}:deadline:${index}`,
        documentId: document.id,
        documentName: deadline.sourceDocumentName || document.displayName,
        title: deadline.title,
        date: deadline.date,
        dateDisplay: deadline.dateDisplay,
        dateKind: deadline.dateKind,
        citation: deadline.sourceReference,
        hasStatedDeadline: deadline.dateKind === "exact",
      });
    });

    analysis.whatYouNeedToDo.actions.forEach((action, index) => {
      if (action.status === "deadline_found" && action.dueDate) return;

      const citation = action.citations[0];
      if (!citation) return;

      const key = `${document.id}|none|${normalizeForComparison(action.action)}`;
      if (seen.has(key)) return;
      seen.add(key);

      entries.push({
        id: `${document.id}:action:${index}`,
        documentId: document.id,
        documentName: document.displayName,
        title: action.action,
        date: null,
        dateDisplay: action.dueDateDisplay ?? "No date found in the document",
        dateKind: "unclear",
        citation,
        hasStatedDeadline: false,
      });
    });
  }

  return entries.sort(compareEntries);
}
