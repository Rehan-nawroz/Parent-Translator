import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  analyzeRequestSchema,
  analyzeSuccessResponseSchema,
  createAnalyzeErrorResponse,
} from "@/lib/contracts/api";
import { analysisResultSchema } from "@/lib/contracts/analysis-schema";
import type { AnalysisResult, Citation } from "@/lib/contracts/analysis";
import { ERROR_CODES, messageForErrorCode, statusForErrorCode } from "@/lib/contracts/errors";
import { LANGUAGE_CODES } from "@/lib/config/languages";

const citation: Citation = {
  page: 2,
  section: "Reading",
  sourceLabel: "Report card - Reading",
  quote: "Sam reads with strong expression and understands story events.",
};

function validResult(): AnalysisResult {
  return {
    document: {
      title: "Grade 4 Report Card - Trimester 2",
      documentType: "report_card",
      languageDetected: "en",
    },
    whatThisSays: {
      summary: "This is Sam's trimester 2 report card for grade 4.",
      citations: [citation],
    },
    whatItMeansForYourChild: {
      points: [
        {
          text: "Reading is approaching grade-level expectations for this point in the year.",
          certainty: "explicit",
          citations: [citation],
        },
      ],
      citations: [citation],
      uncertaintyNotes: [],
    },
    whatYouNeedToDo: {
      actions: [
        {
          action: "Sign and return the report card envelope.",
          dueDate: "2026-03-06",
          dueDateDisplay: "Friday, March 6, 2026",
          responsibleParty: "Parent or guardian",
          status: "deadline_found",
          citations: [citation],
        },
      ],
      citations: [citation],
    },
    whatToAskTheSchool: {
      questions: [
        {
          question: "What does Level N mean?",
          reason: "Reading level is named but not explained.",
          citations: [citation],
        },
        {
          question: "Which fraction skills should we practice?",
          reason: "The comment names fractions without specifics.",
          citations: [citation],
        },
        {
          question: "How is on-time work supported in class?",
          reason: "Completes work on time is marked sometimes.",
          citations: [citation],
        },
      ],
      draftEmail:
        "Hello Ms. Alvarez, thank you for the report card. Could we talk about reading support?",
      citations: [citation],
    },
    jargon: [
      {
        term: "Level N",
        explanation:
          "A book-difficulty level used in guided reading; letters climb as texts get harder.",
        citations: [citation],
      },
    ],
    deadlines: [
      {
        title: "Return the signed report card envelope",
        date: "2026-03-06",
        dateDisplay: "Friday, March 6, 2026",
        sourceDocumentName: "report-card.txt",
        sourceReference: citation,
        dateKind: "exact",
      },
    ],
    safetyNotes: [],
  };
}

/** Shallow patch used to build invalid inputs without fighting the type system. */
function patched(result: AnalysisResult, patch: Record<string, unknown>): unknown {
  return { ...result, ...patch };
}

describe("analysisResultSchema", () => {
  it("accepts a complete result", () => {
    const parsed = analysisResultSchema.safeParse(validResult());
    expect(parsed.success).toBe(true);
  });

  it("rejects a result missing one of the four fixed sections", () => {
    const withoutSection: Record<string, unknown> = { ...validResult() };
    delete withoutSection.whatYouNeedToDo;

    expect(analysisResultSchema.safeParse(withoutSection).success).toBe(false);
  });

  it("rejects an unknown certainty value", () => {
    const result = validResult();
    const input = patched(result, {
      whatItMeansForYourChild: {
        ...result.whatItMeansForYourChild,
        points: [{ text: "Reading is behind.", certainty: "probably", citations: [citation] }],
      },
    });

    expect(analysisResultSchema.safeParse(input).success).toBe(false);
  });

  it("rejects a citation without a quote", () => {
    const result = validResult();
    const input = patched(result, {
      whatThisSays: {
        summary: result.whatThisSays.summary,
        citations: [{ ...citation, quote: " " }],
      },
    });

    expect(analysisResultSchema.safeParse(input).success).toBe(false);
  });

  it("rejects an impossible calendar date but keeps the display text", () => {
    const result = validResult();
    const deadline = result.deadlines[0];
    if (!deadline) throw new Error("fixture is missing a deadline");

    const input = patched(result, {
      deadlines: [{ ...deadline, date: "2026-02-30" }],
    });

    expect(analysisResultSchema.safeParse(input).success).toBe(false);
    expect(deadline.dateDisplay).toBe("Friday, March 6, 2026");
  });

  it("accepts null dates when the document gives no full date", () => {
    const result = validResult();
    const deadline = result.deadlines[0];
    if (!deadline) throw new Error("fixture is missing a deadline");

    const input = patched(result, {
      deadlines: [{ ...deadline, date: null, dateDisplay: "by Friday", dateKind: "unclear" }],
    });

    expect(analysisResultSchema.safeParse(input).success).toBe(true);
  });

  it("rejects more than five school questions", () => {
    const result = validResult();
    const questions = Array.from({ length: 6 }, (_, index) => ({
      question: `Question ${index + 1}?`,
      reason: "Testing the question cap.",
      citations: [citation],
    }));

    const input = patched(result, {
      whatToAskTheSchool: { ...result.whatToAskTheSchool, questions },
    });

    expect(analysisResultSchema.safeParse(input).success).toBe(false);
  });

  it("requires an explanation when fewer than three questions are returned", () => {
    const result = validResult();
    const shortQuestions = result.whatToAskTheSchool.questions.slice(0, 1);

    const withoutExplanation = patched(result, {
      whatToAskTheSchool: { ...result.whatToAskTheSchool, questions: shortQuestions },
    });
    expect(analysisResultSchema.safeParse(withoutExplanation).success).toBe(false);

    const withExplanation = patched(result, {
      whatToAskTheSchool: { ...result.whatToAskTheSchool, questions: shortQuestions },
      safetyNotes: ["The document contains too little information to suggest three questions."],
    });
    expect(analysisResultSchema.safeParse(withExplanation).success).toBe(true);
  });

  it("trims surrounding whitespace in text fields", () => {
    const result = validResult();
    const input = patched(result, {
      whatThisSays: { summary: "  A short summary.  ", citations: [citation] },
    });

    const parsed = analysisResultSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.whatThisSays.summary).toBe("A short summary.");
  });
});

describe("analyzeRequestSchema", () => {
  it("accepts every supported language", () => {
    for (const language of LANGUAGE_CODES) {
      expect(analyzeRequestSchema.safeParse({ language }).success).toBe(true);
    }
  });

  it("rejects an unsupported language", () => {
    expect(analyzeRequestSchema.safeParse({ language: "fr" }).success).toBe(false);
    expect(analyzeRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe("analyze envelopes", () => {
  it("builds a safe error envelope for every code", () => {
    for (const code of ERROR_CODES) {
      const response = createAnalyzeErrorResponse(code, "req_123");
      expect(response.ok).toBe(false);
      expect(response.error.code).toBe(code);
      expect(response.error.message).toBe(messageForErrorCode(code));
      expect(response.error.message.length).toBeGreaterThan(0);
      expect(response.error.message).not.toMatch(/gemini|google|stack|api key|prompt/i);
      expect(statusForErrorCode(code)).toBeGreaterThanOrEqual(400);
    }
  });

  it("maps quota and authentication failures to their expected statuses", () => {
    expect(statusForErrorCode("QUOTA_EXHAUSTED")).toBe(429);
    expect(statusForErrorCode("UNAUTHENTICATED")).toBe(401);
    expect(statusForErrorCode("PROVIDER_UNAVAILABLE")).toBe(503);
  });

  it("rejects usage where remaining analyses exceed the limit", () => {
    const input = {
      ok: true as const,
      requestId: "req_123",
      document: { displayName: "report-card.txt" },
      analysis: validResult(),
      usage: { remainingAnalyses: 4, limit: 3 },
    };

    expect(analyzeSuccessResponseSchema.safeParse(input).success).toBe(false);
    expect(
      analyzeSuccessResponseSchema.safeParse({
        ...input,
        usage: { remainingAnalyses: 2, limit: 3 },
      }).success,
    ).toBe(true);
  });
});

describe("fixtures", () => {
  it("ships synthetic documents for the supported intake types", async () => {
    const fixtureDir = path.join(process.cwd(), "tests", "fixtures");
    const entries = await readdir(fixtureDir);
    const textFixtures = entries.filter((entry) => entry.endsWith(".txt"));

    expect(textFixtures.length).toBeGreaterThanOrEqual(5);

    for (const entry of textFixtures) {
      const content = await readFile(path.join(fixtureDir, entry), "utf8");
      expect(content.length).toBeGreaterThan(200);
      expect(content).toMatch(/synthetic|fictional/i);
    }
  });
});
