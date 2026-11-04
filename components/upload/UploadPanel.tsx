"use client";

import { AlertTriangle, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DEFAULT_LANGUAGE, type LanguageCode } from "@/lib/config/languages";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, SUPPORTED_EXTENSIONS } from "@/lib/config/limits";
import { analyzeErrorResponseSchema, analyzeSuccessResponseSchema } from "@/lib/contracts/api";
import { useSession } from "@/lib/session/session-store";

import { FilePicker } from "./FilePicker";
import { LanguageSelector } from "./LanguageSelector";
import { PrivacyNotice } from "./PrivacyNotice";
import { UploadProgress } from "./UploadProgress";

type UploadError = { code?: string; message: string; creditNote?: string };

export function UploadPanel({ remaining, limit }: { remaining: number; limit: number }) {
  const router = useRouter();
  const { addDocument } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [error, setError] = useState<UploadError | null>(null);
  const [pending, setPending] = useState(false);
  const [stage, setStage] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  function validateClientFile(candidate: File): string | null {
    const extension = candidate.name.split(".").pop()?.toLowerCase() ?? "";
    if (!(SUPPORTED_EXTENSIONS as readonly string[]).includes(extension)) {
      return "That file type is not supported. Use PDF, DOCX, PNG, JPG, or TXT.";
    }
    if (candidate.size === 0) return "That file is empty. Choose a different document.";
    if (candidate.size > MAX_UPLOAD_BYTES) {
      return `That file is larger than ${MAX_UPLOAD_LABEL}. Choose a smaller document.`;
    }
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError({ message: "Choose a document before analyzing." });
      return;
    }
    if (remaining <= 0) {
      router.push("/dashboard/limit-reached");
      return;
    }

    const clientError = validateClientFile(file);
    if (clientError) {
      setError({ message: clientError });
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("language", language);

    setPending(true);
    setStage(1);
    timers.current = [
      window.setTimeout(() => setStage(2), 900),
      window.setTimeout(() => setStage(3), 2400),
    ];

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: form,
        cache: "no-store",
      });
      const json: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const parsedError = analyzeErrorResponseSchema.safeParse(json);
        const code = parsedError.success ? parsedError.data.error.code : "INTERNAL_ERROR";
        const message = parsedError.success
          ? parsedError.data.error.message
          : "We could not complete that request. Please try again.";

        if (code === "UNAUTHENTICATED") {
          router.push("/auth/sign-in");
          router.refresh();
          return;
        }
        if (code === "QUOTA_EXHAUSTED") {
          router.push("/dashboard/limit-reached");
          return;
        }

        setError({
          code,
          message,
          creditNote:
            code === "PROVIDER_UNAVAILABLE" || code === "INVALID_AI_RESPONSE"
              ? "Your analysis credit was restored, so you can try again."
              : undefined,
        });
        return;
      }

      const parsed = analyzeSuccessResponseSchema.safeParse(json);
      if (!parsed.success) {
        setError({ message: "The result could not be read safely. Please try again." });
        return;
      }

      addDocument({
        id: crypto.randomUUID(),
        displayName: parsed.data.document.displayName,
        language,
        analysis: parsed.data.analysis,
        analyzedAt: new Date().toISOString(),
      });
      router.push("/dashboard/result");
      router.refresh();
    } catch {
      setError({ message: "We could not reach the server. Check your connection and try again." });
    } finally {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
      setPending(false);
      setStage(0);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
      <Card className="rounded-panel p-6 sm:p-7">
        <p className="eyebrow">Document analysis</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Upload your school notice
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          One document at a time. Choose the language you want the four-part brief written in, then
          send it for this request only.
        </p>

        {remaining <= 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-ember">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              All {limit} analyses are used on this account.
            </span>
            <Link
              href="/dashboard/limit-reached"
              className="font-semibold underline underline-offset-4"
            >
              View limit
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <FilePicker file={file} onFile={setFile} disabled={pending || remaining <= 0} />
          <LanguageSelector
            value={language}
            onChange={setLanguage}
            disabled={pending || remaining <= 0}
          />
          <PrivacyNotice />

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-ember"
            >
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error.message}</span>
              </p>
              {error.creditNote && (
                <p className="mt-2 text-xs text-emerald-200">{error.creditNote}</p>
              )}
            </div>
          )}

          {pending && <UploadProgress stage={stage} />}

          <Button type="submit" size="lg" className="w-full" disabled={pending || remaining <= 0}>
            {pending ? "Analyzing…" : "Analyze document"}
            {!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </Button>

          <p className="text-center text-xs leading-relaxed text-muted">
            A credit is used only when a validated brief is produced. Invalid uploads and temporary
            failures do not use one.
          </p>
        </form>
      </Card>

      <aside className="space-y-4">
        <Card className="rounded-card p-5">
          <p className="eyebrow">This request</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {remaining}
            <span className="text-sm font-medium text-muted"> of {limit} left</span>
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-crimson to-ruby"
              style={{ width: `${limit > 0 ? (remaining / limit) * 100 : 0}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Three analyses per account is a temporary limit. No payment or reset flow is
            offered.
          </p>
        </Card>

        <Card className="rounded-card p-5">
          <p className="eyebrow">Supported files</p>
          <ul className="mt-3 space-y-2 text-xs text-muted">
            <li>PDF (text or scanned), DOCX, PNG, JPG, TXT</li>
            <li>Up to {MAX_UPLOAD_LABEL} per document</li>
            <li>One document per analysis</li>
          </ul>
          <div className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-xs leading-relaxed text-muted">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-crimson" aria-hidden="true" />
            The document is not saved, and results remain in this tab.
          </div>
        </Card>
      </aside>
    </div>
  );
}
