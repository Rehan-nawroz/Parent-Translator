"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Password reset is unavailable right now. Please try again later.");
      return;
    }

    setPending(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      // Always show the same result so account existence is not revealed.
      setMessage("If that address has an account, a reset link is on its way.");
    } catch {
      setError("We could not send that request. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="Enter the email on your account. We will send a reset link if the account exists."
      footer={
        <span>
          <Link
            href="/auth/sign-in"
            className="font-semibold text-ember underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field
          id="forgot-email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="parent@example.test"
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-ember"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            {message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send reset email"}
        </Button>
      </form>
    </AuthShell>
  );
}
