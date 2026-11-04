import type { AnalysisResult, Citation } from "@/lib/contracts/analysis";

export const SAMPLE_QUOTE = "Return the form by Friday, March 6, 2026.";

export const sampleCitation: Citation = {
  page: 1,
  section: null,
  sourceLabel: "Test document",
  quote: SAMPLE_QUOTE,
};

export function makeAnalysis(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    document: { title: "Test notice", documentType: "notice", languageDetected: "en" },
    whatThisSays: {
      summary: "The school wants the signed form back.",
      citations: [sampleCitation],
    },
    whatItMeansForYourChild: {
      points: [
        {
          text: "Your child can keep attending while the form is reviewed.",
          certainty: "explicit",
          citations: [sampleCitation],
        },
      ],
      citations: [sampleCitation],
      uncertaintyNotes: [],
    },
    whatYouNeedToDo: {
      actions: [
        {
          action: "Return the signed form.",
          dueDate: "2026-03-06",
          dueDateDisplay: "Friday, March 6, 2026",
          responsibleParty: "Parent or guardian",
          status: "deadline_found",
          citations: [sampleCitation],
        },
      ],
      citations: [sampleCitation],
    },
    whatToAskTheSchool: {
      questions: [1, 2, 3].map((index) => ({
        question: `Question ${index} about the notice?`,
        reason: "To understand what happens next.",
        citations: [sampleCitation],
      })),
      draftEmail: "Hello, I have a question about the notice.",
      citations: [sampleCitation],
    },
    jargon: [
      {
        term: "IEP",
        explanation: "A plan for the special education support your child receives.",
        citations: [sampleCitation],
      },
    ],
    deadlines: [
      {
        title: "Return the signed form",
        date: "2026-03-06",
        dateDisplay: "Friday, March 6, 2026",
        sourceDocumentName: "notice.txt",
        sourceReference: sampleCitation,
        dateKind: "exact",
      },
    ],
    safetyNotes: [],
    ...overrides,
  };
}
