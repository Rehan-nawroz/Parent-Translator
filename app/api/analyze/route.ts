import { NextResponse, type NextRequest } from "next/server";

import { AiServiceError } from "@/lib/ai/errors";
import { parseAnalysisResponse } from "@/lib/ai/parse-response";
import { PROMPT_VERSION } from "@/lib/ai/prompt-version";
import { requestAnalysis } from "@/lib/ai/service";
import { MAX_REQUEST_BYTES } from "@/lib/config/limits";
import {
  analyzeRequestSchema,
  createAnalyzeErrorResponse,
  type AnalyzeSuccessResponse,
} from "@/lib/contracts/api";
import { statusForErrorCode, type ErrorCode } from "@/lib/contracts/errors";
import { disposeSource } from "@/lib/documents/cleanup";
import { extractDocument } from "@/lib/documents/extract";
import type { SourceDocument } from "@/lib/documents/types";
import { validateUpload } from "@/lib/documents/validate-upload";
import { checkRateLimit } from "@/lib/security/request-limits";
import { logSafeEvent } from "@/lib/security/safe-logging";
import { getCurrentUser } from "@/lib/supabase/auth";
import { readConsent } from "@/lib/supabase/consent";
import { finalizeAnalysis, releaseAnalysis, reserveAnalysis } from "@/lib/supabase/usage";
import { createRequestId } from "@/lib/utils/ids";

export const runtime = "nodejs";
export const maxDuration = 60;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

/**
 * One document in, one validated brief out. Order matters: authenticated user, then cheap request
 * checks, then quota reservation, then extraction, then AI, then a single finalize. Every failure
 * after a reservation releases it, and the request-scoped source is always disposed.
 */
export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const startedAt = Date.now();
  const state = { status: 500, errorCode: null as ErrorCode | null };

  let reservedUserId: string | null = null;
  let completed = false;
  let source: SourceDocument | null = null;

  const fail = (code: ErrorCode, headers: Record<string, string> = {}) => {
    state.errorCode = code;
    state.status = statusForErrorCode(code);
    return NextResponse.json(createAnalyzeErrorResponse(code, requestId), {
      status: state.status,
      headers: { ...NO_STORE_HEADERS, ...headers },
    });
  };

  try {
    const user = await getCurrentUser();
    if (!user) return fail("UNAUTHENTICATED");

    // Per-user throttle for the demo. The three-analysis quota remains the hard product limit;
    // this only slows repeated invalid or expensive requests before work begins.
    const rate = checkRateLimit(`analyze:${user.id}`, { limit: 10, windowMs: 60_000 });
    if (!rate.allowed) {
      return fail("RATE_LIMITED", { "Retry-After": String(rate.retryAfterSeconds) });
    }

    const consent = await readConsent(user.id);
    if (!consent?.recorded) return fail("CONSENT_REQUIRED");

    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
      return fail("FILE_TOO_LARGE");
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return fail("INVALID_REQUEST");
    }

    const fileValue = form.get("file");
    if (!(fileValue instanceof File)) return fail("MISSING_FILE");

    const parsedLanguage = analyzeRequestSchema.safeParse({ language: form.get("language") });
    if (!parsedLanguage.success) return fail("INVALID_LANGUAGE");

    const validation = await validateUpload(fileValue);
    if (!validation.ok) return fail(validation.code);

    const reservation = await reserveAnalysis(user.id);
    if (!reservation) return fail("INTERNAL_ERROR");
    if (!reservation.allowed) return fail("QUOTA_EXHAUSTED");
    reservedUserId = user.id;

    const extraction = await extractDocument(validation.upload);
    if (!extraction.ok) return fail(extraction.code);
    source = extraction.document;

    const raw = await requestAnalysis({ source, language: parsedLanguage.data.language });
    const analysis = parseAnalysisResponse(raw, source);

    const usage = await finalizeAnalysis(user.id);
    // The credit is consumed once finalize is attempted; never release it afterwards.
    completed = true;
    if (!usage) return fail("INTERNAL_ERROR");

    const payload: AnalyzeSuccessResponse = {
      ok: true,
      requestId,
      document: { displayName: source.displayName },
      analysis,
      usage,
    };

    state.status = 200;
    return NextResponse.json(payload, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return fail(
        error.failure === "INVALID_OUTPUT" ? "INVALID_AI_RESPONSE" : "PROVIDER_UNAVAILABLE",
      );
    }
    return fail("INTERNAL_ERROR");
  } finally {
    disposeSource(source);
    if (reservedUserId && !completed) {
      await releaseAnalysis(reservedUserId);
    }
    logSafeEvent({
      event: "analysis_request",
      requestId,
      outcome: state.errorCode ? "failure" : "success",
      errorCode: state.errorCode ?? undefined,
      status: state.status,
      durationMs: Date.now() - startedAt,
      promptVersion: PROMPT_VERSION,
    });
  }
}
