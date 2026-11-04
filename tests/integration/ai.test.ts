import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateContent: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: mocks.generateContent };
  },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({ rpc: mocks.rpc }),
}));

import { AiServiceError } from "@/lib/ai/errors";
import { parseAnalysisResponse } from "@/lib/ai/parse-response";
import { SYSTEM_INSTRUCTION, buildUserPrompt } from "@/lib/ai/prompt";
import { requestAnalysis } from "@/lib/ai/service";
import type { SourceDocument } from "@/lib/documents/types";
import {
  finalizeAnalysis,
  readUsage,
  releaseAnalysis,
  reserveAnalysis,
} from "@/lib/supabase/usage";

import { makeAnalysis, SAMPLE_QUOTE } from "../helpers/analysis";

const source: SourceDocument = {
  displayName: "notice.txt",
  extension: "txt",
  mimeType: "text/plain",
  kind: "text",
  pages: [{ pageNumber: 1, text: SAMPLE_QUOTE }],
  text: SAMPLE_QUOTE,
  bytes: null,
  pageCount: 1,
  charCount: SAMPLE_QUOTE.length,
};

describe("parseAnalysisResponse", () => {
  it("accepts valid JSON and unwraps a fenced response", () => {
    const raw = JSON.stringify(makeAnalysis());
    expect(parseAnalysisResponse(raw, source).whatThisSays.summary).toContain("signed form");
    expect(parseAnalysisResponse(`\`\`\`json\n${raw}\n\`\`\``, source).document.title).toBe(
      "Test notice",
    );
  });

  it("rejects malformed JSON", () => {
    expect(() => parseAnalysisResponse("not json", source)).toThrow(AiServiceError);
  });

  it("rejects schema-invalid JSON", () => {
    expect(() => parseAnalysisResponse(JSON.stringify({ ok: true }), source)).toThrow(
      AiServiceError,
    );
  });

  it("rejects a citation quote that is not in the source", () => {
    const analysis = makeAnalysis({
      whatThisSays: {
        summary: "Unsupported.",
        citations: [
          { page: 1, section: null, sourceLabel: "Test", quote: "This does not appear anywhere." },
        ],
      },
    });

    expect(() => parseAnalysisResponse(JSON.stringify(analysis), source)).toThrow(AiServiceError);
  });

  it("skips local quote checks for vision documents", () => {
    const vision: SourceDocument = {
      ...source,
      kind: "vision",
      pages: [],
      text: "",
      bytes: new Uint8Array([1]),
      charCount: 0,
    };

    const analysis = makeAnalysis();
    expect(parseAnalysisResponse(JSON.stringify(analysis), vision).document.title).toBe(
      "Test notice",
    );
  });
});

describe("prompt", () => {
  it("contains the grounding, uncertainty, and legal-boundary rules", () => {
    expect(SYSTEM_INSTRUCTION).toContain("untrusted data");
    expect(SYSTEM_INSTRUCTION).toContain("Never provide legal advice");
    expect(SYSTEM_INSTRUCTION).toContain("5th-grade");
    expect(SYSTEM_INSTRUCTION).toContain("Never manufacture a date");
    expect(SYSTEM_INSTRUCTION).toContain("Return only the requested JSON");
    expect(SYSTEM_INSTRUCTION).toContain("whatThisSays");
  });

  it("marks the document as untrusted and names the requested language", () => {
    const prompt = buildUserPrompt({ language: "es", source });
    expect(prompt).toContain("Spanish (es)");
    expect(prompt).toContain("<<<BEGIN UNTRUSTED DOCUMENT DATA>>>");
    expect(prompt).toContain(SAMPLE_QUOTE);
  });
});

describe("requestAnalysis", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    mocks.generateContent.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the provider text", async () => {
    mocks.generateContent.mockResolvedValue({ text: '{"ok":true}' });
    await expect(requestAnalysis({ source, language: "en" })).resolves.toBe('{"ok":true}');
  });

  it("fails safely when the API key is missing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(requestAnalysis({ source, language: "en" })).rejects.toMatchObject({
      failure: "MISSING_CONFIG",
    });
  });

  it("maps provider failures without leaking details", async () => {
    mocks.generateContent.mockRejectedValue(new Error("provider secret detail"));
    await expect(requestAnalysis({ source, language: "en" })).rejects.toMatchObject({
      failure: "PROVIDER_ERROR",
    });
  });
});

describe("quota operations", () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
  });

  it("reserves, finalizes, and releases through protected RPCs", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { allowed: true, remaining: 2 }, error: null });
    await expect(reserveAnalysis("user-1")).resolves.toEqual({
      allowed: true,
      usage: { remainingAnalyses: 2, limit: 3 },
    });
    expect(mocks.rpc).toHaveBeenCalledWith("reserve_analysis", {
      p_user_id: "user-1",
      p_limit: 3,
    });

    mocks.rpc.mockResolvedValueOnce({ data: { remaining: 1 }, error: null });
    await expect(finalizeAnalysis("user-1")).resolves.toEqual({
      remainingAnalyses: 1,
      limit: 3,
    });

    mocks.rpc.mockResolvedValueOnce({ data: { released: true }, error: null });
    await expect(releaseAnalysis("user-1")).resolves.toBe(true);
  });

  it("refuses a reservation when the quota is exhausted", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { allowed: false, remaining: 0 }, error: null });
    await expect(reserveAnalysis("user-1")).resolves.toEqual({
      allowed: false,
      usage: { remainingAnalyses: 0, limit: 3 },
    });
  });

  it("reads remaining credits and fails closed on database errors", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { remaining: 0 }, error: null });
    await expect(readUsage("user-1")).resolves.toEqual({ remainingAnalyses: 0, limit: 3 });

    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    await expect(readUsage("user-1")).resolves.toBeNull();
  });
});
