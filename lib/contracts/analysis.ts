/**
 * Canonical TypeScript contract for one Parent Translator analysis result.
 *
 * This file is the single source of truth for the shape that Gemini must return and that the
 * UI renders. The runtime guard for the same shape lives in `analysis-schema.ts`; change both
 * together, and keep the four required output sections.
 */

/** How strongly a statement is supported by the document. */
export type Certainty = "explicit" | "supported_interpretation" | "unclear";

/** Whether an action item came with a stated deadline. */
export type ActionDeadlineStatus = "deadline_found" | "no_deadline_found" | "unclear";

/** How precisely a deadline is expressed in the document. */
export type DeadlineDateKind = "exact" | "range" | "recurring" | "unclear";

/**
 * A short pointer back into the uploaded document. `page` is null for unpaginated sources
 * (plain text, DOCX, images) and `section` is null when the source has no headings.
 */
export type Citation = {
  page: number | null;
  section: string | null;
  sourceLabel: string;
  quote: string;
};

export type InterpretationPoint = {
  text: string;
  certainty: Certainty;
  citations: Citation[];
};

export type ActionItem = {
  action: string;
  /** ISO `YYYY-MM-DD` only when a complete date is stated; otherwise null. */
  dueDate: string | null;
  /** The phrasing from the document, e.g. "by Friday", preserved verbatim. */
  dueDateDisplay: string | null;
  responsibleParty: string | null;
  status: ActionDeadlineStatus;
  citations: Citation[];
};

export type QuestionItem = {
  question: string;
  reason: string;
  citations: Citation[];
};

export type JargonItem = {
  term: string;
  explanation: string;
  citations: Citation[];
};

export type DeadlineItem = {
  title: string;
  /** ISO `YYYY-MM-DD` only when a complete date is stated; otherwise null. */
  date: string | null;
  /** The phrasing from the document, preserved so "Friday" is never invented into a date. */
  dateDisplay: string;
  sourceDocumentName: string;
  sourceReference: Citation;
  dateKind: DeadlineDateKind;
};

export type AnalysisResult = {
  document: {
    title: string | null;
    documentType: string | null;
    languageDetected: string | null;
  };
  whatThisSays: {
    summary: string;
    citations: Citation[];
  };
  whatItMeansForYourChild: {
    points: InterpretationPoint[];
    citations: Citation[];
    uncertaintyNotes: string[];
  };
  whatYouNeedToDo: {
    actions: ActionItem[];
    citations: Citation[];
  };
  whatToAskTheSchool: {
    questions: QuestionItem[];
    draftEmail: string;
    citations: Citation[];
  };
  jargon: JargonItem[];
  deadlines: DeadlineItem[];
  safetyNotes: string[];
};

/** The four fixed parent-facing sections, in display order. None may be omitted. */
export const ANALYSIS_SECTION_KEYS = [
  "whatThisSays",
  "whatItMeansForYourChild",
  "whatYouNeedToDo",
  "whatToAskTheSchool",
] as const;

export type AnalysisSectionKey = (typeof ANALYSIS_SECTION_KEYS)[number];
