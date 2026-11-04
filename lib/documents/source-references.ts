import type { AnalysisResult, Citation } from "@/lib/contracts/analysis";
import { normalizeForComparison } from "@/lib/utils/text";

import type { SourceDocument } from "./types";

/** Renders text pages with explicit page markers so the model can cite page numbers. */
export function buildSourceTranscript(document: SourceDocument): string {
  if (document.kind === "vision") return "";
  return document.pages.map((page) => `--- Page ${page.pageNumber} ---\n${page.text}`).join("\n\n");
}

/** Returns the page where a quote actually appears, or null when it cannot be grounded. */
export function findQuotePage(quote: string, document: SourceDocument): number | null {
  const needle = normalizeForComparison(quote);
  if (needle.length < 8) return null;

  for (const page of document.pages) {
    if (normalizeForComparison(page.text).includes(needle)) return page.pageNumber;
  }
  return null;
}

function collectCitations(analysis: AnalysisResult): Citation[] {
  return [
    ...analysis.whatThisSays.citations,
    ...analysis.whatItMeansForYourChild.citations,
    ...analysis.whatItMeansForYourChild.points.flatMap((point) => point.citations),
    ...analysis.whatYouNeedToDo.citations,
    ...analysis.whatYouNeedToDo.actions.flatMap((action) => action.citations),
    ...analysis.whatToAskTheSchool.citations,
    ...analysis.whatToAskTheSchool.questions.flatMap((question) => question.citations),
    ...analysis.jargon.flatMap((item) => item.citations),
    ...analysis.deadlines.map((deadline) => deadline.sourceReference),
  ];
}

/**
 * Counts citations whose quote cannot be found in the extracted text. Vision-based sources have no
 * local text to compare against, so they are skipped rather than treated as failures.
 */
export function countUngroundedCitations(
  analysis: AnalysisResult,
  document: SourceDocument,
): number {
  if (document.kind === "vision") return 0;
  return collectCitations(analysis).filter(
    (citation) => findQuotePage(citation.quote, document) === null,
  ).length;
}
