import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  reserveAnalysis: vi.fn(),
  finalizeAnalysis: vi.fn(),
  releaseAnalysis: vi.fn(),
  validateUpload: vi.fn(),
  extractDocument: vi.fn(),
  requestAnalysis: vi.fn(),
  parseAnalysisResponse: vi.fn(),
  checkRateLimit: vi.fn(),
  readConsent: vi.fn(),
}));

vi.mock("@/lib/supabase/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/supabase/usage", () => ({
  reserveAnalysis: mocks.reserveAnalysis,
  finalizeAnalysis: mocks.finalizeAnalysis,
  releaseAnalysis: mocks.releaseAnalysis,
}));
vi.mock("@/lib/documents/validate-upload", () => ({ validateUpload: mocks.validateUpload }));
vi.mock("@/lib/documents/extract", () => ({ extractDocument: mocks.extractDocument }));
vi.mock("@/lib/ai/service", () => ({ requestAnalysis: mocks.requestAnalysis }));
vi.mock("@/lib/ai/parse-response", () => ({ parseAnalysisResponse: mocks.parseAnalysisResponse }));
vi.mock("@/lib/security/request-limits", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("@/lib/supabase/consent", () => ({ readConsent: mocks.readConsent }));

import { POST } from "@/app/api/analyze/route";
import { AiServiceError } from "@/lib/ai/errors";
import type { SourceDocument } from "@/lib/documents/types";

import { makeAnalysis } from "../helpers/analysis";

const source: SourceDocument = {
  displayName: "notice.txt",
  extension: "txt",
  mimeType: "text/plain",
  kind: "text",
  pages: [{ pageNumber: 1, text: "Return the form by Friday, March 6, 2026." }],
  text: "Return the form by Friday, March 6, 2026.",
  bytes: null,
  pageCount: 1,
  charCount: 44,
};

function makeRequest(fields: { file?: boolean; language?: string; userId?: string }): NextRequest {
  const form = new FormData();
  if (fields.file) form.append("file", new File(["hello"], "notice.txt", { type: "text/plain" }));
  if (fields.language) form.append("language", fields.language);
  if (fields.userId) form.append("userId", fields.userId);
  return new NextRequest("http://localhost/api/analyze", { method: "POST", body: form });
}

async function readBody(response: Response) {
  return (await response.json()) as {
    ok: boolean;
    requestId: string;
    error?: { code: string; message: string };
    usage?: { remainingAnalyses: number; limit: number };
    document?: { displayName: string };
  };
}

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1", email: null });
    mocks.checkRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.readConsent.mockResolvedValue({
      recorded: true,
      termsVersion: "2026-11-01",
      privacyVersion: "2026-11-01",
    });
    mocks.validateUpload.mockResolvedValue({
      ok: true,
      upload: {
        displayName: "notice.txt",
        extension: "txt",
        mimeType: "text/plain",
        size: 5,
        bytes: new Uint8Array([1]),
      },
    });
    mocks.extractDocument.mockResolvedValue({ ok: true, document: source });
    mocks.reserveAnalysis.mockResolvedValue({
      allowed: true,
      usage: { remainingAnalyses: 2, limit: 3 },
    });
    mocks.requestAnalysis.mockResolvedValue("{}");
    mocks.parseAnalysisResponse.mockReturnValue(makeAnalysis());
    mocks.finalizeAnalysis.mockResolvedValue({ remainingAnalyses: 2, limit: 3 });
    mocks.releaseAnalysis.mockResolvedValue(true);
  });

  it("rejects an unauthenticated request without touching quota", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const response = await POST(makeRequest({ file: true, language: "en" }));
    expect(response.status).toBe(401);
    expect((await readBody(response)).error?.code).toBe("UNAUTHENTICATED");
    expect(mocks.reserveAnalysis).not.toHaveBeenCalled();
  });

  it("requires recorded policy consent before reserving a credit", async () => {
    mocks.readConsent.mockResolvedValue({
      recorded: false,
      termsVersion: null,
      privacyVersion: null,
    });

    const response = await POST(makeRequest({ file: true, language: "en" }));
    expect(response.status).toBe(403);
    expect((await readBody(response)).error?.code).toBe("CONSENT_REQUIRED");
    expect(mocks.reserveAnalysis).not.toHaveBeenCalled();
  });

  it("rejects a rate-limited request before reserving a credit", async () => {
    mocks.checkRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 30 });

    const response = await POST(makeRequest({ file: true, language: "en" }));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
    expect((await readBody(response)).error?.code).toBe("RATE_LIMITED");
    expect(mocks.reserveAnalysis).not.toHaveBeenCalled();
  });

  it("rejects a missing language", async () => {
    const response = await POST(makeRequest({ file: true }));
    expect(response.status).toBe(400);
    expect((await readBody(response)).error?.code).toBe("INVALID_LANGUAGE");
  });

  it("uses the verified session user instead of a client-supplied user id", async () => {
    const response = await POST(makeRequest({ file: true, language: "en", userId: "attacker" }));
    expect(response.status).toBe(200);
    expect(mocks.reserveAnalysis).toHaveBeenCalledWith("user-1");
    expect(mocks.finalizeAnalysis).toHaveBeenCalledWith("user-1");
  });

  it("rejects an invalid upload before reserving a credit", async () => {
    mocks.validateUpload.mockResolvedValue({ ok: false, code: "UNSUPPORTED_FILE" });
    const response = await POST(makeRequest({ file: true, language: "en" }));
    expect(response.status).toBe(415);
    expect((await readBody(response)).error?.code).toBe("UNSUPPORTED_FILE");
    expect(mocks.reserveAnalysis).not.toHaveBeenCalled();
    expect(mocks.releaseAnalysis).not.toHaveBeenCalled();
  });

  it("blocks a user with no credits left", async () => {
    mocks.reserveAnalysis.mockResolvedValue({
      allowed: false,
      usage: { remainingAnalyses: 0, limit: 3 },
    });
    const response = await POST(makeRequest({ file: true, language: "en" }));
    expect(response.status).toBe(429);
    expect((await readBody(response)).error?.code).toBe("QUOTA_EXHAUSTED");
    expect(mocks.extractDocument).not.toHaveBeenCalled();
  });

  it.each([
    [3, 3],
    [2, 3],
    [1, 3],
  ])("returns %i of %i credits after a successful analysis", async (remaining, limit) => {
    mocks.reserveAnalysis.mockResolvedValue({
      allowed: true,
      usage: { remainingAnalyses: remaining, limit },
    });
    mocks.finalizeAnalysis.mockResolvedValue({ remainingAnalyses: remaining, limit });

    const response = await POST(makeRequest({ file: true, language: "en" }));
    expect(response.status).toBe(200);

    const body = await readBody(response);
    expect(body.ok).toBe(true);
    expect(body.document?.displayName).toBe("notice.txt");
    expect(body.usage).toEqual({ remainingAnalyses: remaining, limit });
    expect(mocks.finalizeAnalysis).toHaveBeenCalledTimes(1);
    expect(mocks.releaseAnalysis).not.toHaveBeenCalled();
  });

  it("releases the reservation when the provider fails", async () => {
    mocks.requestAnalysis.mockRejectedValue(new AiServiceError("PROVIDER_ERROR"));

    const response = await POST(makeRequest({ file: true, language: "en" }));
    expect(response.status).toBe(503);
    expect((await readBody(response)).error?.code).toBe("PROVIDER_UNAVAILABLE");
    expect(mocks.releaseAnalysis).toHaveBeenCalledWith("user-1");
    expect(mocks.finalizeAnalysis).not.toHaveBeenCalled();
  });

  it("releases the reservation when the model output is invalid", async () => {
    mocks.parseAnalysisResponse.mockImplementation(() => {
      throw new AiServiceError("INVALID_OUTPUT");
    });

    const response = await POST(makeRequest({ file: true, language: "en" }));
    expect(response.status).toBe(502);
    expect((await readBody(response)).error?.code).toBe("INVALID_AI_RESPONSE");
    expect(mocks.releaseAnalysis).toHaveBeenCalledTimes(1);
  });

  it("fails safely when Gemini is not configured", async () => {
    mocks.requestAnalysis.mockRejectedValue(new AiServiceError("MISSING_CONFIG"));

    const response = await POST(makeRequest({ file: true, language: "en" }));
    expect(response.status).toBe(503);
    expect((await readBody(response)).error?.message).not.toMatch(/gemini|api key/i);
  });
});
