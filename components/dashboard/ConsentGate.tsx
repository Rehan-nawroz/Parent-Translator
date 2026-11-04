"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { acceptPoliciesAction } from "@/lib/supabase/consent-actions";

export function ConsentGate() {
  const router = useRouter();
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleAccept() {
    setError(null);
    if (!terms || !privacy) {
      setError("Please accept both documents to continue.");
      return;
    }

    setPending(true);
    try {
      const result = await acceptPoliciesAction();
      if (!result.ok) {
        setError("We could not record that acceptance. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("We could not record that acceptance. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-12">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>

      <Card className="rounded-panel p-6 sm:p-8">
        <p className="eyebrow">Before your first analysis</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Confirm the policies</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Your account is ready. Accept the current Terms and Privacy Notice so we can record the
          version you agreed to. Only the version and a timestamp are stored.
        </p>

        <div className="mt-6 space-y-4">
          <label className="flex items-start gap-3 text-sm leading-relaxed text-mist/85">
            <input
              type="checkbox"
              checked={terms}
              onChange={(event) => setTerms(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong bg-abyss accent-crimson"
            />
            <span>
              I accept the{" "}
              <Link
                href="/terms"
                target="_blank"
                className="text-ember underline underline-offset-4"
              >
                Terms of Use
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-mist/85">
            <input
              type="checkbox"
              checked={privacy}
              onChange={(event) => setPrivacy(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong bg-abyss accent-crimson"
            />
            <span>
              I have read the{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="text-ember underline underline-offset-4"
              >
                Privacy Notice
              </Link>
              .
            </span>
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-ember"
          >
            {error}
          </p>
        )}

        <Button className="mt-6 w-full" onClick={handleAccept} disabled={pending}>
          {pending ? "Recording…" : "Accept and continue"}
        </Button>
      </Card>
    </div>
  );
}
