import { z } from "zod";

import type { AnalysisResult } from "./analysis";

/**
 * Runtime guard for the AI response. Gemini output is untrusted: nothing reaches the UI until
 * it parses through this schema.
 */

const MAX_TITLE = 200;
const MAX_SECTION_LABEL = 160;
const MAX_QUOTE = 400;
const MAX_SUMMARY = 1500;
const MAX_SHORT_TEXT = 400;
const MAX_ACTION_TEXT = 300;
const MAX_DISPLAY_DATE = 80;
const MAX_DRAFT_EMAIL = 2000;
const MAX_SAFETY_NOTE = 500;

const MAX_POINTS = 8;
const MAX_ACTIONS = 8;
const MAX_QUESTIONS = 5;
const MIN_QUESTIONS = 3;
const MAX_JARGON = 12;
const MAX_DEADLINES = 10;
const MAX_CITATIONS = 12;
const MAX_NOTES = 8;

function isRealCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD when a complete date is known, or null.")
  .refine(isRealCalendarDate, "Date must be a real calendar date.");

const citationSchema = z.object({
  page: z.number().int().min(1).max(10_000).nullable(),
  section: z.string().trim().max(MAX_SECTION_LABEL).nullable(),
  sourceLabel: z.string().trim().min(1).max(MAX_SECTION_LABEL),
  quote: z.string().trim().min(1).max(MAX_QUOTE),
});

const interpretationPointSchema = z.object({
  text: z.string().trim().min(1).max(MAX_SHORT_TEXT),
  certainty: z.enum(["explicit", "supported_interpretation", "unclear"]),
  citations: z.array(citationSchema).min(1).max(MAX_CITATIONS),
});

const actionItemSchema = z.object({
  action: z.string().trim().min(1).max(MAX_ACTION_TEXT),
  dueDate: isoDateSchema.nullable(),
  dueDateDisplay: z.string().trim().max(MAX_DISPLAY_DATE).nullable(),
  responsibleParty: z.string().trim().max(MAX_SECTION_LABEL).nullable(),
  status: z.enum(["deadline_found", "no_deadline_found", "unclear"]),
  citations: z.array(citationSchema).min(1).max(MAX_CITATIONS),
});

const questionItemSchema = z.object({
  question: z.string().trim().min(1).max(MAX_ACTION_TEXT),
  reason: z.string().trim().min(1).max(MAX_SHORT_TEXT),
  citations: z.array(citationSchema).min(1).max(MAX_CITATIONS),
});

const jargonItemSchema = z.object({
  term: z.string().trim().min(1).max(80),
  explanation: z.string().trim().min(1).max(MAX_SHORT_TEXT),
  citations: z.array(citationSchema).min(1).max(MAX_CITATIONS),
});

const deadlineItemSchema = z.object({
  title: z.string().trim().min(1).max(MAX_TITLE),
  date: isoDateSchema.nullable(),
  dateDisplay: z.string().trim().min(1).max(MAX_DISPLAY_DATE),
  sourceDocumentName: z.string().trim().min(1).max(MAX_TITLE),
  sourceReference: citationSchema,
  dateKind: z.enum(["exact", "range", "recurring", "unclear"]),
});

export const analysisResultSchema = z
  .object({
    document: z.object({
      title: z.string().trim().max(MAX_TITLE).nullable(),
      documentType: z.string().trim().max(80).nullable(),
      languageDetected: z.string().trim().max(40).nullable(),
    }),
    whatThisSays: z.object({
      summary: z.string().trim().min(1).max(MAX_SUMMARY),
      citations: z.array(citationSchema).max(MAX_CITATIONS),
    }),
    whatItMeansForYourChild: z.object({
      points: z.array(interpretationPointSchema).max(MAX_POINTS),
      citations: z.array(citationSchema).max(MAX_CITATIONS),
      uncertaintyNotes: z.array(z.string().trim().min(1).max(MAX_SHORT_TEXT)).max(MAX_NOTES),
    }),
    whatYouNeedToDo: z.object({
      actions: z.array(actionItemSchema).max(MAX_ACTIONS),
      citations: z.array(citationSchema).max(MAX_CITATIONS),
    }),
    whatToAskTheSchool: z.object({
      questions: z.array(questionItemSchema).max(MAX_QUESTIONS),
      draftEmail: z.string().trim().min(1).max(MAX_DRAFT_EMAIL),
      citations: z.array(citationSchema).max(MAX_CITATIONS),
    }),
    jargon: z.array(jargonItemSchema).max(MAX_JARGON),
    deadlines: z.array(deadlineItemSchema).max(MAX_DEADLINES),
    safetyNotes: z.array(z.string().trim().min(1).max(MAX_SAFETY_NOTE)).max(MAX_NOTES),
  })
  .superRefine((result, ctx) => {
    const questionCount = result.whatToAskTheSchool.questions.length;
    if (questionCount < MIN_QUESTIONS && result.safetyNotes.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["whatToAskTheSchool", "questions"],
        message: `Provide ${MIN_QUESTIONS} to ${MAX_QUESTIONS} questions, or explain in safetyNotes why fewer can be asked.`,
      });
    }
  }) satisfies z.ZodType<AnalysisResult>;

export type SchemaAnalysisResult = z.infer<typeof analysisResultSchema>;

type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/**
 * Compile-time guard: fails `npm run typecheck` if this schema and `analysis.ts` drift apart.
 * Exported so the check cannot be dropped as dead code.
 */
const schemaMatchesCanonicalTypes: IsEqual<AnalysisResult, SchemaAnalysisResult> = true;

export { schemaMatchesCanonicalTypes };
